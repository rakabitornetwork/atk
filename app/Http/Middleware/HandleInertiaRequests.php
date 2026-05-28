<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function share(Request $request): array
    {
        $user = $request->user();
        $settings = Schema::hasTable('store_settings')
            ? DB::table('store_settings')->first()
            : null;

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $user ? [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                    'profile_photo_url' => $user->profile_photo_url,
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
                'store_name' => $settings?->store_name ?? config('atk.store_name'),
                'default_theme' => config('atk.default_theme'),
                'logo_url' => $this->publicStorageUrl($settings?->logo_path),
                'logo_icon_url' => $this->publicStorageUrl($settings?->logo_icon_path),
                'navbar_logo_url' => $this->publicStorageUrl($settings?->navbar_logo_path),
            ],
        ];
    }

    private function publicStorageUrl(?string $path): ?string
    {
        if (! $path) {
            return null;
        }

        return '/storage/'.ltrim($path, '/');
    }
}
