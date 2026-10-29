<?php

use Illuminate\Foundation\Application;
use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

// Determine if the application is in maintenance mode...
if (file_exists($maintenance = __DIR__.'/../storage/framework/maintenance.php')) {
    require $maintenance;
}

// A config cache built on another machine (e.g. the Windows dev box) holds that machine's
// absolute paths, which breaks views/cache on the server. Drop it so a plain upload just works;
// Laravel then reads the config directly (or `php artisan optimize` rebuilds it for this server).
$configCache = __DIR__.'/../bootstrap/cache/config.php';
if (is_file($configCache)) {
    $basePath = substr(var_export(dirname(__DIR__), true), 1, -1);
    if (strpos((string) file_get_contents($configCache), $basePath) === false) {
        // the route and event caches were built alongside it, so they go too
        foreach (['config.php', 'routes-v7.php', 'events.php'] as $cached) {
            @unlink(__DIR__.'/../bootstrap/cache/'.$cached);
        }
    }
}

// Register the Composer autoloader...
require __DIR__.'/../vendor/autoload.php';

// Bootstrap Laravel and handle the request...
/** @var Application $app */
$app = require_once __DIR__.'/../bootstrap/app.php';

$app->handleRequest(Request::capture());
