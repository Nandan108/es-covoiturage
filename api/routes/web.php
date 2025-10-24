<?php

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
