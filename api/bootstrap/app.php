<?php

use App\Http\Responses\ProblemDetails;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        // web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // no middleware for now
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions
            ->shouldRenderJsonWhen(function (Request $request, Throwable $e) {
                if ($request->is('api/*') || $request->wantsJson()) {
                    return true;
                }
            })
            ->render(function (Throwable $e, Request $request) {
                return ProblemDetails::fromException($e, $request->path());
            });
    })->create();
