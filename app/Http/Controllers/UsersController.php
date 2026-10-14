<?php

use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

public function index(Request $request)
{
    $users = User::query()
        ->when($request->filled('search'), function ($q) use ($request) {
            $search = $request->search;
            $q->where(function ($query) use ($search) {
                $query->where('name', 'like', "%{$search}%")
                      ->orWhere('username', 'like', "%{$search}%");
            });
        })
        ->withCount(['followers', 'following'])
        ->withExists([
            'followers as is_following' => function ($q) {
                $q->where('follower_id', auth()->id());
            }
        ])
        ->latest()
        ->paginate(20)
        ->withQueryString();

    return Inertia::render('Users/Index', [
        'users'   => UserResource::collection($users),
        'filters' => $request->only('search'),
    ]);
}