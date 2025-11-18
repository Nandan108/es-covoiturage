<?php

use App\Http\Controllers\Admin\AdminAuthController;
use App\Http\Controllers\Admin\AdminEventController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\EventController;
use App\Http\Controllers\OfferController;
use Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse;
use Illuminate\Cookie\Middleware\EncryptCookies;
use Illuminate\Routing\Middleware\SubstituteBindings;
use Illuminate\Session\Middleware\AuthenticateSession;
use Illuminate\Session\Middleware\StartSession;
use Illuminate\Support\Facades\Route;
use Illuminate\View\Middleware\ShareErrorsFromSession;

// Routes that require the full "web" middleware stack (sessions, cookies, CSRF)
$webMiddleware = [
    EncryptCookies::class,
    AddQueuedCookiesToResponse::class,
    StartSession::class,
    AuthenticateSession::class,
    ShareErrorsFromSession::class,
    SubstituteBindings::class,
];

// Public API Routes
// - Events
Route::resource('events', EventController::class)
    ->only(['index', 'show']);
Route::post('contact', ContactController::class)
    ->name('contact.submit');

// - Offers + Admin API (both need session-authenticated admin access)
Route::middleware($webMiddleware)->group(function () {
    Route::resource('events.offers', OfferController::class)
        ->only(['show', 'store', 'update', 'destroy']);

    Route::prefix('admin')
        ->name('admin.')
        ->group(function () {
            Route::post('login', [AdminAuthController::class, 'login'])->name('admin.login');

            // Protected Admin Routes
            Route::middleware('auth:admin')->group(function () {
                Route::post('logout', [AdminAuthController::class, 'logout'])->name('admin.logout');
                Route::get('me', [AdminAuthController::class, 'me']);
                Route::apiResource('events', AdminEventController::class);
            });
        });
});
