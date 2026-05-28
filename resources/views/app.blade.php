<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">
        <title inertia>{{ config('app.name', 'ATK POS') }}</title>
        <script>
            (function () {
                var theme = localStorage.getItem('atk_theme') || '{{ config('atk.default_theme', 'dark') }}';
                document.documentElement.dataset.theme = theme;
                document.documentElement.classList.toggle('dark', theme !== 'light');
                document.documentElement.style.colorScheme = theme === 'light' ? 'light' : 'dark';
            })();
        </script>
        @routes
        @viteReactRefresh
        @vite(['resources/css/app.css', 'resources/js/app.jsx'])
        @inertiaHead
    </head>
    <body class="font-sans antialiased">
        @inertia
    </body>
</html>
