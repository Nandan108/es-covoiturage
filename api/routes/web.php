<?php

use App\Http\Controllers\ImageController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

Route::get('images/{image}', [ImageController::class, 'show']);

Route::resource('images', ImageController::class)
    ->only(['show']);