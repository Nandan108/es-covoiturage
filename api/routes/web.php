<?php

use App\Http\Controllers\Admin\AdminAuthController;
use App\Http\Controllers\Admin\AdminEventController;
use App\Models\Image;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Route;

/** Serve event images
 * This path should not be hit if the web server is correctly configured to serve
 * static files from the storage/images directory directly.
 */
Route::get('/images/events/{filename}', function (string $filename) {
    // Prevent path traversal and normalise the requested file name.
    $filename = basename($filename);

    /** @var Image|null $image */
    $image = Image::where('name', $filename)->first();
    if (!$image) {
        abort(404);
    }

    $image->ensureStoredLocally();
    $path = $image->storagePath();
    if (!File::exists($path)) {
        abort(404);
    }

    return response()->file($path, [
        'Cache-Control' => 'public, max-age=31536000, immutable',
    ]);
})->where('filename', '[A-Za-z0-9._-]+');

// Admin API needs the full "web" middleware stack (sessions, cookies, CSRF) so it
// lives here rather than in routes/api.php. Endpoints still return JSON.
Route::prefix('api/admin')->middleware('web')->group(function () {
    Route::post('login', [AdminAuthController::class, 'login'])->name('admin.login');

    Route::middleware('auth:admin')->group(function () {
        Route::post('logout', [AdminAuthController::class, 'logout'])->name('admin.logout');
        Route::get('me', [AdminAuthController::class, 'me']);
        Route::apiResource('events', AdminEventController::class);
    });
});
