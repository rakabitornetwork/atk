<?php

namespace App\Http\Controllers;

use App\Services\Deployment\GitDeploymentService;
use App\Support\Activity;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ApplicationDeployController extends Controller
{
    public function index(Request $request, GitDeploymentService $deployment): Response
    {
        abort_unless($request->user()?->isAdmin(), 403);

        return Inertia::render('Settings/GitDeployment', [
            'status' => $deployment->status(true),
        ]);
    }

    public function sync(Request $request, GitDeploymentService $deployment): RedirectResponse
    {
        abort_unless($request->user()?->isAdmin(), 403);

        if (! (bool) config('deployment.ui_enabled')) {
            return back()->with('error', 'Pembaruan dari panel belum diaktifkan di server ini.');
        }

        $result = $deployment->syncFromOrigin([
            'composer' => $request->boolean('run_composer', true),
            'npm' => $request->boolean('run_npm', true),
            'migrate' => $request->boolean('run_migrate', true),
            'optimize' => $request->boolean('run_optimize', true),
        ]);

        Activity::log($request, $result['ok'] ? 'deployment.synced' : 'deployment.failed', 'deployment', null, ['logs' => $result['logs']]);

        return back()->with([
            $result['ok'] ? 'success' : 'error' => $result['ok'] ? 'Aplikasi berhasil diperbarui dari GitHub.' : 'Update gagal. Periksa ringkasan proses.',
            'deploy_logs' => $result['logs'],
        ]);
    }
}
