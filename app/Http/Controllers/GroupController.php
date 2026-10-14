<?php

namespace App\Http\Controllers;

use App\Models\Group;
use App\Models\GroupPost;
use App\Models\GroupInvitation;
use App\Models\User;
use App\Models\GroupPostLike;
use App\Models\GroupPostComment;
use App\Models\GroupPostCommentLike;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class GroupController extends Controller
{
    public function index(Request $request)
    {
        $groups = Group::with('owner')
            ->withCount('members')
            ->when($request->search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('description', 'like', "%{$search}%");
                });
            })
            ->latest()
            ->get();

        $pendingInvitations = GroupInvitation::with(['group', 'inviter'])
            ->where('invitee_id', Auth::id())
            ->where('status', 'pending')
            ->latest()
            ->get();

        $archivedInvitations = GroupInvitation::with(['group', 'inviter'])
            ->where('invitee_id', Auth::id())
            ->whereIn('status', ['rejected', 'accepted'])
            ->latest()
            ->get();

        return Inertia::render('Groups/Index', [
            'groups'               => $groups,
            'pendingInvitations'   => $pendingInvitations,
            'archivedInvitations'  => $archivedInvitations,
            'filters'              => $request->only('search'),
        ]);
    }

    public function show(Request $request, Group $group)
    {
        $group->load(['owner'])->loadCount('members');

        $isMember = $group->isMember(Auth::id());
        $isOwner  = $group->isOwner(Auth::id());

        $members = $group->members()
            ->when($request->member_search, function ($q, $search) {
                $q->where(function ($query) use ($search) {
                    $query->where('name', 'like', "%{$search}%")
                        ->orWhere('username', 'like', "%{$search}%");
                });
            })
            ->get();

        $posts = $group->posts()
            ->with([
                'user:id,name,username,avatar',
                'comments' => function ($q) {
                    $q->whereNull('parent_id')
                        ->with([
                            'user:id,name,username,avatar',
                            'replies' => function ($r) {
                                $r->with('user:id,name,username,avatar')
                                    ->withCount('likes')
                                    ->latest();
                            },
                        ])
                        ->withCount('likes')
                        ->latest();
                },
            ])
            ->withCount('likes')
            ->when($request->post_search, function ($q, $search) {
                $q->where(function ($query) use ($search) {
                    $query->where('title', 'like', "%{$search}%")
                        ->orWhere('body', 'like', "%{$search}%");
                });
            })
            ->latest()
            ->get()
            ->map(function ($post) {
                $post->is_liked = $post->isLikedBy(Auth::id());
                return $post;
            });

        return Inertia::render('Groups/Show', [
            'group'    => $group,
            'members'  => $members,
            'posts'    => $posts,
            'isMember' => $isMember,
            'isOwner'  => $isOwner,
            'filters'  => $request->only(['member_search', 'post_search']),
        ]);
    }

    public function create()
    {
        return Inertia::render('Groups/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'        => 'required|string|max:100',
            'description' => 'nullable|string|max:1000',
        ]);

        $group = Group::create([
            ...$validated,
            'user_id' => Auth::id(),
        ]);

        $group->members()->attach(Auth::id(), ['role' => 'admin']);

        return redirect()
            ->route('groups.show', $group)
            ->with('success', 'Grup berhasil dibuat!');
    }

    public function edit(Group $group)
    {
        if (!$group->isOwner(Auth::id())) {
            abort(403, 'Hanya pembuat grup yang bisa edit.');
        }

        return Inertia::render('Groups/Edit', [
            'group' => $group,
        ]);
    }

    public function update(Request $request, Group $group)
    {
        if (!$group->isOwner(Auth::id())) {
            abort(403);
        }

        $validated = $request->validate([
            'name'        => 'required|string|max:100',
            'description' => 'nullable|string|max:1000',
        ]);

        $group->update($validated);

        return redirect()
            ->route('groups.show', $group)
            ->with('success', 'Grup berhasil diperbarui!');
    }

    public function destroy(Group $group)
    {
        if (!$group->isOwner(Auth::id())) {
            abort(403);
        }

        $group->delete();

        return redirect()
            ->route('groups.index')
            ->with('success', 'Grup berhasil dihapus!');
    }

    // ======================
    // JOIN / LEAVE
    // ======================

    public function join(Group $group)
    {
        if ($group->isMember(Auth::id())) {
            return back()->with('error', 'Kamu sudah bergabung di grup ini.');
        }

        $group->members()->attach(Auth::id(), ['role' => 'member']);

        return back()->with('success', 'Berhasil bergabung ke grup!');
    }

    public function leave(Group $group)
    {
        if ($group->isOwner(Auth::id())) {
            return back()->with('error', 'Pembuat grup tidak bisa keluar. Hapus grup jika ingin mengakhiri.');
        }

        $group->members()->detach(Auth::id());

        return back()->with('success', 'Kamu telah keluar dari grup.');
    }

    // ======================
    // INVITE
    // ======================

    public function invite(Request $request, Group $group)
    {
        if (!$group->isMember(Auth::id())) {
            abort(403, 'Hanya member yang bisa invite.');
        }

        $request->validate([
            'username' => 'required|string|exists:users,username',
        ]);

        $invitee = User::where('username', $request->username)->first();

        if ($invitee->id === Auth::id()) {
            return back()->with('error', 'Tidak bisa invite diri sendiri.');
        }

        if ($group->isMember($invitee->id)) {
            return back()->with('error', 'User sudah menjadi member.');
        }

        $existing = GroupInvitation::where('group_id', $group->id)
            ->where('invitee_id', $invitee->id)
            ->where('status', 'pending')
            ->first();

        if ($existing) {
            return back()->with('error', 'Undangan sudah dikirim sebelumnya.');
        }

        GroupInvitation::create([
            'group_id'   => $group->id,
            'inviter_id' => Auth::id(),
            'invitee_id' => $invitee->id,
            'status'     => 'pending',
        ]);

        return back()->with('success', "Undangan berhasil dikirim ke @{$invitee->username}");
    }

    public function acceptInvitation(GroupInvitation $invitation)
    {
        if ($invitation->invitee_id !== Auth::id()) {
            abort(403);
        }

        if ($invitation->status !== 'pending') {
            return back()->with('error', 'Undangan sudah tidak berlaku.');
        }

        $invitation->loadMissing('group');

        if (!$invitation->group) {
            return back()->with('error', 'Grup tidak ditemukan.');
        }

        $group  = $invitation->group;
        $userId = Auth::id();

        if (!$group->isMember($userId)) {
            $group->members()->attach($userId, ['role' => 'member']);
        }

        $invitation->update(['status' => 'accepted']);

        return redirect()
            ->route('groups.show', $group->id)
            ->with('success', 'Berhasil bergabung ke grup!');
    }

    public function rejectInvitation(GroupInvitation $invitation)
    {
        if ($invitation->invitee_id !== Auth::id()) {
            abort(403);
        }

        $invitation->update(['status' => 'rejected']);

        return back()->with('success', 'Undangan ditolak.');
    }

    // ======================
    // GROUP POSTS
    // ======================

    public function storePost(Request $request, Group $group)
    {
        if (!$group->isMember(Auth::id())) {
            abort(403, 'Hanya member yang bisa post.');
        }

        $validated = $request->validate([
            'title' => 'required|string|max:200',
            'body'  => 'required|string|max:5000',
        ]);

        $group->posts()->create([
            ...$validated,
            'user_id' => Auth::id(),
        ]);

        return back()->with('success', 'Post berhasil dibuat!');
    }

    public function destroyPost(Group $group, GroupPost $post)
    {
        if ($post->group_id !== $group->id) {
            abort(404);
        }

        if ($post->user_id !== Auth::id() && !$group->isOwner(Auth::id())) {
            abort(403);
        }

        $post->delete();

        return back()->with('success', 'Post berhasil dihapus!');
    }

    public function likePost(Group $group, GroupPost $post)
    {
        if ($post->group_id !== $group->id) {
            abort(404);
        }

        if (!$group->isMember(Auth::id())) {
            return back()->with('error', 'Join grup dulu untuk like.');
        }

        $existing = GroupPostLike::where('group_post_id', $post->id)
            ->where('user_id', Auth::id())
            ->first();

        if ($existing) {
            $existing->delete();
            return back();
        }

        GroupPostLike::create([
            'group_post_id' => $post->id,
            'user_id'       => Auth::id(),
        ]);

        return back();
    }

    // ======================
    // COMMENT / REPLY
    // ======================

    public function commentPost(Request $request, Group $group, GroupPost $post)
    {
        if ($post->group_id !== $group->id) {
            abort(404);
        }

        if (!$group->isMember(Auth::id())) {
            return back()->with('error', 'Join grup dulu untuk komentar.');
        }

        $request->validate([
            'body'      => 'required|string|max:1000',
            'parent_id' => 'nullable|exists:group_post_comments,id',
        ]);

        if ($request->parent_id) {
            GroupPostComment::where('id', $request->parent_id)
                ->where('group_post_id', $post->id)
                ->firstOrFail();
        }

        GroupPostComment::create([
            'group_post_id' => $post->id,
            'user_id'       => Auth::id(),
            'parent_id'     => $request->parent_id,
            'body'          => $request->body,
        ]);

        return back()->with('success', 'Komentar ditambahkan.');
    }

    public function likeComment(Group $group, GroupPost $post, GroupPostComment $comment)
    {
        if ($post->group_id !== $group->id || $comment->group_post_id !== $post->id) {
            abort(404);
        }

        if (!$group->isMember(Auth::id())) {
            return back()->with('error', 'Join grup dulu untuk like komentar.');
        }

        $existing = GroupPostCommentLike::where('user_id', Auth::id())
            ->where('group_post_comment_id', $comment->id)
            ->first();

        if ($existing) {
            $existing->delete();
        } else {
            GroupPostCommentLike::create([
                'user_id'               => Auth::id(),
                'group_post_comment_id' => $comment->id,
            ]);
        }

        return back();
    }

    public function destroyComment(Group $group, GroupPost $post, GroupPostComment $comment)
    {
        if ($comment->group_post_id !== $post->id || $post->group_id !== $group->id) {
            abort(404);
        }

        if ($comment->user_id !== Auth::id() && !$group->isOwner(Auth::id())) {
            abort(403);
        }

        $comment->delete();

        return back()->with('success', 'Komentar dihapus.');
    }
}