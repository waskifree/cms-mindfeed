<?php

namespace App\Http\Controllers;

use App\Models\Conversation;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ChatController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();

        $conversations = $user->conversations()
            ->with([
                'users:id,name,username,email,avatar',
                'latestMessage',
            ])
            ->get()
            ->map(function ($conv) use ($user) {
                $otherUser = $conv->users->firstWhere('id', '!=', $user->id);

                $isMutual = false;
                if ($otherUser) {
                    $isMutual = $user->following()
                        ->where('followed_id', $otherUser->id)
                        ->exists()
                        && $user->followers()
                        ->where('follower_id', $otherUser->id)
                        ->exists();
                }

                $isHidden = (bool) data_get($conv, 'pivot.is_hidden', false);

                return [
                    'id'            => $conv->id,
                    'otherUser'     => $otherUser ? [
                        'id'       => $otherUser->id,
                        'name'     => $otherUser->name,
                        'username' => $otherUser->username,
                        'email'    => $otherUser->email,
                        'avatar'   => $otherUser->avatar
                            ? (str_starts_with($otherUser->avatar, 'http')
                                ? $otherUser->avatar
                                : '/storage/' . ltrim($otherUser->avatar, '/'))
                            : null,
                    ] : null,
                    'is_mutual'     => $isMutual,
                    'is_hidden'     => $isHidden,
                    'unread_count'  => method_exists($conv, 'unreadCountFor')
                        ? $conv->unreadCountFor($user->id)
                        : 0,
                    'latestMessage' => $conv->latestMessage ? [
                        'id'   => $conv->latestMessage->id,
                        'body' => $conv->latestMessage->body,
                    ] : null,
                    'updated_at'    => $conv->updated_at,
                ];
            })
            ->filter(fn ($c) => $c['otherUser'] !== null)
            ->values();

        $primaryConversations = $conversations
            ->filter(fn ($c) => ! $c['is_hidden'] && $c['is_mutual'])
            ->values();

        $requestConversations = $conversations
            ->filter(fn ($c) => ! $c['is_hidden'] && ! $c['is_mutual'])
            ->values();

        $hiddenConversations = $conversations
            ->filter(fn ($c) => $c['is_hidden'])
            ->values();

        // Followers untuk New Chat (+ avatar)
        $usersQuery = $user->followers()
            ->select('users.id', 'users.name', 'users.email', 'users.username', 'users.avatar')
            ->orderBy('users.name');

        if ($request->filled('user_search')) {
            $search = $request->user_search;
            $usersQuery->where(function ($q) use ($search) {
                $q->where('users.name', 'like', "%{$search}%")
                  ->orWhere('users.email', 'like', "%{$search}%")
                  ->orWhere('users.username', 'like', "%{$search}%");
            });
        }

        $users = $usersQuery->paginate(15)->withQueryString();

        // Format avatar di pagination
        $users->getCollection()->transform(function ($u) {
            $u->avatar = $u->avatar
                ? (str_starts_with($u->avatar, 'http')
                    ? $u->avatar
                    : '/storage/' . ltrim($u->avatar, '/'))
                : null;
            return $u;
        });

        return Inertia::render('Chat/Index', [
            'primaryConversations' => $primaryConversations,
            'requestConversations' => $requestConversations,
            'hiddenConversations'  => $hiddenConversations,
            'users'                => $users,
            'auth' => [
                'user' => [
                    'id'                       => $user->id,
                    'name'                     => $user->name,
                    'email'                    => $user->email,
                    'username'                 => $user->username,
                    'avatar'                   => $user->avatar
                        ? (str_starts_with($user->avatar, 'http')
                            ? $user->avatar
                            : '/storage/' . ltrim($user->avatar, '/'))
                        : null,
                    'is_dnd'                   => $user->is_dnd,
                    'allow_non_follower_chats' => $user->allow_non_follower_chats,
                ],
            ],
        ]);
    }

    public function toggleHide(Conversation $conversation)
    {
        $user = Auth::user();

        $pivot = DB::table('conversation_user')
            ->where('conversation_id', $conversation->id)
            ->where('user_id', $user->id)
            ->first();

        if (! $pivot) {
            abort(403, 'Kamu bukan peserta conversation ini.');
        }

        $newValue = $pivot->is_hidden ? 0 : 1;

        DB::table('conversation_user')
            ->where('conversation_id', $conversation->id)
            ->where('user_id', $user->id)
            ->update([
                'is_hidden'  => $newValue,
                'updated_at' => now(),
            ]);

        return redirect()->route('chat.index');
    }

    public function toggleDnd()
    {
        $user = Auth::user();
        $user->is_dnd = ! $user->is_dnd;
        $user->save();

        return back();
    }

    public function toggleAllowNonFollower()
    {
        $user = Auth::user();
        $user->allow_non_follower_chats = ! $user->allow_non_follower_chats;
        $user->save();

        return back();
    }

    public function start(User $user)
    {
        $auth = Auth::user();

        if ($user->id === $auth->id) {
            return back()->with('error', 'Tidak bisa chat dengan diri sendiri.');
        }

        $isFollowerOfTarget = $user->followers()
            ->where('follower_id', $auth->id)
            ->exists();

        if (! $isFollowerOfTarget && ! $user->allow_non_follower_chats) {
            return back()->with('error', 'User ini tidak menerima pesan dari non-follower.');
        }

        $conversation = Conversation::whereHas('users', fn ($q) => $q->where('user_id', $auth->id))
            ->whereHas('users', fn ($q) => $q->where('user_id', $user->id))
            ->first();

        if (! $conversation) {
            $conversation = Conversation::create();

            $conversation->users()->attach([
                $auth->id => ['is_hidden' => false],
                $user->id => ['is_hidden' => false],
            ]);
        } else {
            $conversation->users()->updateExistingPivot($auth->id, [
                'is_hidden' => false,
            ]);
        }

        return redirect()->route('chat.show', $conversation->id);
    }

    public function store(Request $request, Conversation $conversation)
    {
        $user = Auth::user();

        if (! $conversation->users()->where('user_id', $user->id)->exists()) {
            abort(403);
        }

        $validated = $request->validate([
            'body' => ['required', 'string', 'max:5000'],
        ]);

        $conversation->messages()->create([
            'user_id' => $user->id,
            'body'    => $validated['body'],
        ]);

        $conversation->users()->updateExistingPivot($user->id, [
            'last_read_at' => now(),
        ]);

        return back();
    }

    public function show(Conversation $conversation)
    {
        $user = Auth::user();

        if (! $conversation->users()->where('user_id', $user->id)->exists()) {
            abort(403);
        }

        $conversation->users()->updateExistingPivot($user->id, [
            'is_hidden'    => false,
            'last_read_at' => now(),
        ]);

        $conversation->load([
            'users:id,name,username,email,avatar',
            'messages' => fn ($q) => $q
                ->with('user:id,name,username,avatar')
                ->orderBy('created_at'),
        ]);

        $otherUser = $conversation->users->firstWhere('id', '!=', $user->id);

        // Format avatar otherUser
        if ($otherUser && $otherUser->avatar) {
            $otherUser->avatar = str_starts_with($otherUser->avatar, 'http')
                ? $otherUser->avatar
                : '/storage/' . ltrim($otherUser->avatar, '/');
        }

        // Format avatar di messages
        $messages = $conversation->messages->map(function ($msg) {
            if ($msg->user && $msg->user->avatar) {
                $msg->user->avatar = str_starts_with($msg->user->avatar, 'http')
                    ? $msg->user->avatar
                    : '/' . ltrim($msg->user->avatar, '/');
            }
            return $msg;
        });

        return Inertia::render('Chat/Show', [
            'conversation' => $conversation,
            'otherUser'    => $otherUser,
            'messages'     => $messages,
            'auth' => [
                'user' => [
                    'id'       => $user->id,
                    'name'     => $user->name,
                    'username' => $user->username,
                    'avatar'   => $user->avatar
                        ? (str_starts_with($user->avatar, 'http')
                            ? $user->avatar
                            : '/' . ltrim($user->avatar, '/'))
                        : null,
                    'is_dnd'   => $user->is_dnd,
                ],
            ],
        ]);
    }
}