<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response;

class ShareUserData
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user) {
            Inertia::share('auth', [
                'user' => [
                    'id'       => $user->id,
                    'name'     => $user->name,
                    'email'    => $user->email,
                    'username' => $user->username,
                    'avatar'   => $user->avatar,
                    'bio'      => $user->bio,
                    'roles'    => method_exists($user, 'getRoleNames')
                                    ? $user->getRoleNames()->toArray()
                                    : [],
                    'isAdmin'  => method_exists($user, 'hasRole')
                                    ? $user->hasRole('admin')
                                    : false,
                ],
            ]);
        }

        return $next($request);
    }
}