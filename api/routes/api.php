<?php


use App\Http\Controllers\ImageController;
use App\Http\Controllers\MyEventController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\EventController;
use App\Http\Controllers\OfferController;

Route::get('events', [EventController::class, 'index']);
Route::get('events/{event}', [EventController::class, 'show']);

// Route::middleware('auth')->group(function () {
//     Route::resource('my-events', MyEventController::class);
//     Route::delete('auth', [AuthController::class, 'destroy'])->name('logout');
// });

// My Events
Route::resource('my-events', MyEventController::class);

Route::post('events/{event}/offers', [OfferController::class, 'store']);
Route::patch('events/{event}/offers/{offer}', [OfferController::class, 'update']);

// Offers as resource nested in events
Route::resource('events.offers', OfferController::class);

// Images served from DB storage
Route::resource('images', ImageController::class)
    ->only(['show']);