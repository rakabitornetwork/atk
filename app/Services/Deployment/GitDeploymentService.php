<?php

namespace App\Services\Deployment;

use Symfony\Component\Process\Process;

class GitDeploymentService
{
    public function status(bool $fetchRemote = true): array
    {
        if (! is_dir(base_path('.git'))) {
            return [
                'ui_enabled' => (bool) config('deployment.ui_enabled'),
                'is_git_repo' => false,
                'has_update' => false,
                'dirty' => false,
                'commits_ahead' => 0,
                'commits_behind' => 0,
            ];
        }

        if ($fetchRemote) {
            $this->git(['fetch', 'origin', (string) config('deployment.git_branch', 'main')]);
        }

        $branch = (string) config('deployment.git_branch', 'main');
        $dirtyOutput = trim($this->git(['status', '--porcelain'])['output']);
        $localSha = trim($this->git(['rev-parse', '--short', 'HEAD'])['output']);
        $remoteSha = trim($this->git(['rev-parse', '--short', 'origin/'.$branch])['output']);
        $localCommitCount = (int) trim($this->git(['rev-list', '--count', 'HEAD'])['output']);
        $remoteCommitCount = (int) trim($this->git(['rev-list', '--count', 'origin/'.$branch])['output']);
        $behind = (int) trim($this->git(['rev-list', '--count', 'HEAD..origin/'.$branch])['output']);
        $ahead = (int) trim($this->git(['rev-list', '--count', 'origin/'.$branch.'..HEAD'])['output']);

        return [
            'ui_enabled' => (bool) config('deployment.ui_enabled'),
            'is_git_repo' => true,
            'has_update' => $behind > 0,
            'dirty' => $dirtyOutput !== '',
            'dirty_count' => $dirtyOutput === '' ? 0 : count(explode("\n", $dirtyOutput)),
            'local_version' => $this->releaseVersion($localCommitCount),
            'remote_version' => $this->releaseVersion($remoteCommitCount),
            'local_sha' => $localSha,
            'remote_sha' => $remoteSha,
            'commits_ahead' => $ahead,
            'commits_behind' => $behind,
            'requires_manual_update' => $ahead > 0 && $behind > 0,
            'can_sync' => (bool) config('deployment.ui_enabled') && $behind > 0 && $ahead === 0,
        ];
    }

    public function syncFromOrigin(array $options): array
    {
        $steps = [];
        $branch = (string) config('deployment.git_branch', 'main');

        foreach ([
            'git pull' => ['git', 'pull', '--ff-only', 'origin', $branch],
            'composer install' => [config('deployment.composer_binary', 'composer'), 'install', '--no-interaction', '--prefer-dist', '--optimize-autoloader'],
            'npm build' => ['npm', 'run', 'build'],
            'migrate' => [config('deployment.php_binary', 'php'), 'artisan', 'migrate', '--force'],
            'optimize' => [config('deployment.php_binary', 'php'), 'artisan', 'optimize'],
        ] as $label => $command) {
            if ($label === 'composer install' && ! ($options['composer'] ?? true)) {
                continue;
            }
            if ($label === 'npm build' && ! ($options['npm'] ?? true)) {
                continue;
            }
            if ($label === 'migrate' && ! ($options['migrate'] ?? true)) {
                continue;
            }
            if ($label === 'optimize' && ! ($options['optimize'] ?? true)) {
                continue;
            }

            $result = $this->run($command);
            $steps[] = ['step' => $label, 'success' => $result['success'], 'message' => trim($result['output']) ?: 'Selesai'];
            if (! $result['success']) {
                return ['ok' => false, 'logs' => $steps];
            }
        }

        return ['ok' => true, 'logs' => $steps];
    }

    private function git(array $args): array
    {
        return $this->run(['git', ...$args]);
    }

    private function releaseVersion(int $commitCount): string
    {
        return '1.0.'.max(0, $commitCount);
    }

    private function run(array $command): array
    {
        $process = new Process($command, base_path(), null, null, (int) config('deployment.timeout', 300));
        $process->run();

        return [
            'success' => $process->isSuccessful(),
            'output' => $process->getOutput().$process->getErrorOutput(),
        ];
    }
}
