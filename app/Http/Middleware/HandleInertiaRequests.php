<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function share(Request $request): array
    {
        $user = $request->user();

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $user ? [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                ] : null,
                'is_admin' => $user?->isAdmin() ?? false,
                'is_cashier' => $user?->isCashier() ?? false,
            ],
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
                'deploy_logs' => fn () => $request->session()->get('deploy_logs', []),
            ],
            'app' => [
                'name' => config('app.name', 'ATK POS'),
                'store_name' => config('atk.store_name'),
                'default_theme' => config('atk.default_theme'),
            ],
        ];
    }
}
