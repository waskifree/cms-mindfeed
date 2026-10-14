<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
   public function share(Request $request): array
{
    $user = $request->user();

    $authUser = null;

    if ($user) {
        try {
            $roles = method_exists($user, 'getRoleNames')
                ? $user->getRoleNames()->toArray()
                : [];

            $isAdmin = method_exists($user, 'hasRole')
                ? $user->hasRole('admin')
                : false;

            $authUser = [
                'id'               => $user->id,
                'name'             => $user->name,
                'email'            => $user->email,
                'username'         => $user->username,
                'avatar'           => $user->avatar,
                'bio'              => $user->bio,
                'roles'            => $roles,
                'isAdmin'          => $isAdmin,
                'from_middleware'  => true,
                'has_roles_trait'  => method_exists($user, 'getRoleNames'),
            ];
        } catch (\Throwable $e) {
            $authUser = [
                'id'              => $user->id,
                'name'            => $user->name,
                'error'           => $e->getMessage(),
                'from_middleware' => true,
            ];
        }
    }

    return [
        ...parent::share($request),
        'auth' => [
            'user' => $authUser,
        ],
    ];
}
}
