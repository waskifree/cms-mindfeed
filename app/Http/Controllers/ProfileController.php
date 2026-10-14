<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
use App\Http\Resources\UserResource;          // ← tambahkan ini
use App\Models\User;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->get('search');

        $users = User::query()
            ->when($search, function ($query) use ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'LIKE', "%{$search}%")
                      ->orWhere('username', 'LIKE', "%{$search}%")
                      ->orWhere('email', 'LIKE', "%{$search}%");
                });
            })
            ->withCount(['followers', 'following'])
            ->withExists([
                'followers as is_following' => function ($q) {
                    $q->where('follower_id', auth()->id());
                }
            ])
            ->latest()
            ->paginate(12)
            ->withQueryString();

        return Inertia::render('Profile/Index', [
            'users'   => UserResource::collection($users),
            'filters' => [
                'search' => $search,
            ],
        ]);
    }

    public function show(Request $request, User $user): Response
    {
        $currentUser = Auth::user();
        $search = $request->get('search');

        $contents = $user->contents()
            ->with([
                'user:id,name,username,avatar',
                'category:id,name',
                'comments.user:id,name,username,avatar',
            ])
            ->when(
                !$currentUser || $currentUser->id !== $user->id,
                function ($query) use ($currentUser, $user) {
                    $query->where(function ($q) use ($currentUser, $user) {
                        $q->where('visibility', 'public');

                        if ($currentUser && $currentUser->isFollowing($user)) {
                            $q->orWhere('visibility', 'followers');
                        }
                    });
                }
            )
            ->when($search, function ($query) use ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('title', 'like', "%{$search}%")
                      ->orWhere('description', 'like', "%{$search}%")
                      ->orWhere('paragraph', 'like', "%{$search}%");
                });
            })
            ->latest()
            ->get()
            ->map(function ($content) {
                $content->is_liked = auth()->check()
                    ? $content->likes()->where('user_id', auth()->id())->exists()
                    : false;
                return $content;
            });

        $user->loadCount(['followers', 'following']);
        $user->is_following = auth()->check()
        ? auth()->user()->isFollowing($user)
        : false;

        // Bisa juga pakai UserResource di sini
        return Inertia::render('Profile/Show', [
            'user' => (new UserResource($user))->resolve() + [
                'is_following' => $currentUser ? $currentUser->isFollowing($user) : false,
            ],
            'contents'     => $contents,
            'isOwnProfile' => $currentUser?->id === $user->id,
            'filters'      => [
                'search' => $search,
            ],
        ]);
    }

    public function toggleFollow(User $user)
    {
        $follower = Auth::user();

        if (!$follower) {
            return redirect()->route('login');
        }

        if ($follower->id === $user->id) {
            return back()->with('error', 'Tidak bisa follow diri sendiri');
        }

        $isFollowing = $follower->isFollowing($user);

        if ($isFollowing) {
            $follower->following()->detach($user->id);
        } else {
            $follower->following()->attach($user->id);
        }

        $user->loadCount(['followers', 'following']);

        return back()->with([
            'success' => $isFollowing
                ? 'Berhenti mengikuti ' . $user->name
                : 'Berhasil mengikuti ' . $user->name,
        ]);
    }

   public function followers(User $user)
    {
        $followers = $user->followers()
            ->withCount(['followers', 'following'])
            ->withExists([
                'followers as is_following' => function ($q) {
                    $q->where('follower_id', auth()->id());
                }
            ])
            ->orderByPivot('created_at', 'desc')   // ← terbaru di atas
            ->paginate(20);

        return Inertia::render('Follow/Followers', [
            'user'      => new UserResource($user->loadCount(['followers', 'following'])),
            'followers' => UserResource::collection($followers),
        ]);
    }

    public function following(User $user)
    {
        $following = $user->following()
            ->withCount(['followers', 'following'])
            ->withExists([
                'followers as is_following' => function ($q) {
                    $q->where('follower_id', auth()->id());
                }
            ])
            ->orderByPivot('created_at', 'desc')   // ← terbaru di atas
            ->paginate(20);

        return Inertia::render('Follow/Following', [
            'user'      => new UserResource($user->loadCount(['followers', 'following'])),
            'following' => UserResource::collection($following),
        ]);
    }

    // ... method edit, update, destroy tetap sama (tidak perlu diubah)


    public function edit(Request $request): Response
    {
        $user = $request->user();

        return Inertia::render('Profile/Edit', [
            'mustVerifyEmail' => $user instanceof MustVerifyEmail,
            'status' => session('status'),
            'user' => $user->only([
                'id',
                'name',
                'email',
                'bio',
                'avatar',
                'username'
            ]),
        ]);
    }

    /**
     * Update the user's profile information.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $user = $request->user();

        $user->fill($request->validated());

        $user->bio = $request->input('bio', $user->bio);

        if ($request->hasFile('image')) {
            if ($user->avatar) {
                Storage::disk('public')->delete($user->avatar);
            }
            $path = $request->file('image')->store('avatars', 'public');
            $user->avatar = $path;
        }

        if ($user->isDirty('email')) {
            $user->email_verified_at = null;
        }

        $user->save();

        return Redirect::route('profile.edit')
            ->with('status', 'profile-updated');
    }

    /**
     * Delete the user's account.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return Redirect::to('/');
    }
}