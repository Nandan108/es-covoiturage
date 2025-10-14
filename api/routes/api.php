<?php

use App\Http\Controllers\EventController;
use App\Http\Controllers\ImageController;
use App\Http\Controllers\MyEventController;
use App\Http\Controllers\OfferController;
use Illuminate\Support\Facades\Route;

// Public API Routes
// - Events
Route::resource('events', EventController::class)
    ->only(['index', 'show']);
// - Offers as resource nested in events
Route::resource('events.offers', OfferController::class)
    ->only(['show', 'store', 'update', 'destroy']);

// Route::middleware('auth')->group(function () {
//     Route::resource('my-events', MyEventController::class);
//     Route::delete('auth', [AuthController::class, 'destroy'])->name('logout');
// });

// Images, served from DB storage for now
Route::resource('images', ImageController::class)
    ->only(['show']);
