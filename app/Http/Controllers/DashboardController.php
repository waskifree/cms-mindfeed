<?php

namespace App\Http\Controllers;

use App\Models\Content;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Models\Category;
use App\Models\User;

class DashboardController extends Controller
{
    /**
     * Dashboard utama.
     * Menampilkan semua content yang bersifat public.
     */
   public function index(Request $request)
    {
        $search = $request->input('search');
        $user = Auth::user();
        $authId = $user?->id;

        // ID user yang kamu follow (untuk konten visibility = followers)
        $followingIds = $user
            ? $user->following()->pluck('users.id')
            : collect();

        $contents = Content::with([
                'user',
                'category',
                'comments.user',
            ])
            ->withCount('likes')
            ->visibleTo($user)
            ->where(function ($query) use ($authId, $followingIds) {
                // 1. Public → semua orang bisa lihat
                $query->where('visibility', 'public')

                // 2. Followers → milik sendiri ATAU milik orang yang kamu follow
                ->orWhere(function ($q) use ($authId, $followingIds) {
                    $q->where('visibility', 'followers')
                        ->where(function ($q2) use ($authId, $followingIds) {
                            $q2->where('created_by', $authId) // ganti ke user_id jika perlu
                                ->orWhereIn('created_by', $followingIds);
                        });
                })

                // 3. Private → hanya milik sendiri
                ->orWhere(function ($q) use ($authId) {
                    $q->where('visibility', 'private')
                        ->where('created_by', $authId); // ganti ke user_id jika perlu
                });
            })
            ->when($search, function ($query) use ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('title', 'like', "%{$search}%")
                        ->orWhere('description', 'like', "%{$search}%")
                        ->orWhere('paragraph', 'like', "%{$search}%")
                        ->orWhereHas('user', function ($user) use ($search) {
                            $user->where('name', 'like', "%{$search}%")
                                ->orWhere('username', 'like', "%{$search}%");
                        })
                        ->orWhereHas('category', function ($category) use ($search) {
                            $category->where('name', 'like', "%{$search}%");
                        });
                })->simplePaginate(10);
            })
            ->latest()
            ->get()
            ->map(function ($content) use ($authId) {
                $content->is_liked = $authId
                    ? $content->likes()->where('user_id', $authId)->exists()
                    : false;
                return $content;
            });

        $joinedGroups = $user
            ? $user->groups()->withCount('members')->latest()->get()
            : collect();

        return Inertia::render('Dashboard', [
            'contents' => $contents,
            'joinedGroups' => $joinedGroups,
            'filters' => [
                'search' => $search,
            ],
        ]);
    }

    /**
     * DashFriends.
     * Content public dari following + followers.
     */
 public function DashFriends(Request $request)
    {
        $search = $request->input('search');
        $user = Auth::user();

        if (!$user) {
            return redirect()->route('login');
        }

        $following = $user->following()->get();
        $followers = $user->followers()->get();

        // MUTUAL = saling follow
        $followingIds = $following->pluck('id');
        $followerIds  = $followers->pluck('id');

        $mutualIds = $followingIds->intersect($followerIds)->values();

        $mutuals = User::whereIn('id', $mutualIds)
            ->get(['id', 'name', 'username', 'email']);

        // Gabungkan ID mutual + ID user sendiri
        $allowedIds = $mutualIds->push($user->id)->unique()->values();

        // Konten dari mutual + konten sendiri
        $contents = Content::with(['user', 'category', 'comments.user'])
            ->withCount('likes')
            ->whereIn('created_by', $allowedIds)
            ->where(function ($q) use ($user) {
                // Konten public dari mutual
                $q->where('visibility', 'public')
                // Atau konten milik sendiri (boleh private / followers / public)
                ->orWhere('created_by', $user->id);
            })
            ->when($search, function ($query) use ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('title', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%")
                    ->orWhere('paragraph', 'like', "%{$search}%");
                });
            })
            ->latest()
            ->get()
            ->map(function ($content) use ($user) {
                $content->is_liked = $content->likes()
                    ->where('user_id', $user->id)
                    ->exists();
                return $content;
            });

        return Inertia::render('DashFriends', [
            'mutuals'     => $mutuals,
            'contents'    => $contents,
            'categories'  => \App\Models\Category::orderBy('name')->get(['id', 'name']),
            'filters'     => ['search' => $search],
        ]);
    }
}