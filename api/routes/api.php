<?php

use App\Http\Controllers\EventController;
use App\Http\Controllers\OfferController;
use Illuminate\Support\Facades\Route;

// Public API Routes
// - Events
Route::resource('events', EventController::class)
    ->only(['index', 'show']);
// - Offers as resource nested in events
Route::resource('events.offers', OfferController::class)
    ->only(['show', 'store', 'update', 'destroy']);

// Note that admin routes are defined in routes/web.php, so they get
// the full "web" middleware stack (sessions, cookies, CSRF)
