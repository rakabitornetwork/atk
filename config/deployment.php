<?php

return [
    'ui_enabled' => (bool) env('DEPLOYMENT_UI_ENABLED', false),
    'auto_sync_enabled' => (bool) env('DEPLOYMENT_AUTO_SYNC', false),
    'git_branch' => (string) env('DEPLOYMENT_GIT_BRANCH', 'main'),
    'run_composer' => (bool) env('DEPLOYMENT_RUN_COMPOSER', true),
    'run_npm_build' => (bool) env('DEPLOYMENT_RUN_NPM_BUILD', true),
    'run_migrate' => (bool) env('DEPLOYMENT_RUN_MIGRATE', true),
    'run_optimize' => (bool) env('DEPLOYMENT_RUN_OPTIMIZE', true),
    'php_binary' => env('DEPLOYMENT_PHP_BINARY', 'php'),
    'composer_binary' => env('DEPLOYMENT_COMPOSER_BINARY', 'composer'),
    'timeout' => (int) env('DEPLOYMENT_COMMAND_TIMEOUT', 300),
    'github_compare_base' => env('DEPLOYMENT_GITHUB_COMPARE_BASE'),
];
