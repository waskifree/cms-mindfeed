<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class FollowController extends Controller
{
    public function follow(User $user)
    {
        $follower = Auth::user();

        if (!$follower) {
            return redirect()->route('login');
        }

        if ($follower->id === $user->id) {
            return back()->with('error', 'Tidak bisa follow diri sendiri');
        }

        $follower->following()->syncWithoutDetaching($user->id);

        return back()->with('success', 'Berhasil mengikuti ' . $user->name);
    }

    public function unfollow(User $user)
    {
        $follower = Auth::user();

        if (!$follower) {
            return redirect()->route('login');
        }

        $follower->following()->detach($user->id);

        return back()->with('success', 'Berhenti mengikuti ' . $user->name);
    }

    /**
     * Toggle follow (cocok untuk Inertia)
     */
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
            $message = 'Berhenti mengikuti ' . $user->name;
        } else {
            $follower->following()->attach($user->id);
            $message = 'Berhasil mengikuti ' . $user->name;
        }

        // Reload count biar data di frontend ikut update
        $user->loadCount('followers');

        return back()->with([
            'success' => $message,
            // optional: kirim data terbaru kalau mau dipakai di frontend
            'is_following' => !$isFollowing,
            'followers_count' => $user->followers_count,
        ]);
    }
}