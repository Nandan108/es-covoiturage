<?php

namespace App\Providers;

use App\Models\Image;
use Illuminate\Support\Facades\File;
use Illuminate\Support\ServiceProvider;

final class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    #[\Override]
    public function register(): void
    {
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $storageDir = storage_path(Image::STORAGE_DIR);
        File::ensureDirectoryExists($storageDir);

        $projectRoot = dirname(base_path());
        $publicRoot = $projectRoot.DIRECTORY_SEPARATOR.'public';
        $publicImagesDir = $publicRoot.DIRECTORY_SEPARATOR.'images';
        $publicEventsDir = $publicImagesDir.DIRECTORY_SEPARATOR.'events';

        // Clean up the legacy symlink inside api/public if it exists.
        $legacyPublicDir = public_path('images');
        if (is_link($legacyPublicDir)) {
            @File::delete($legacyPublicDir);
        }

        File::ensureDirectoryExists($publicImagesDir);

        if (!File::exists($publicEventsDir)) {
            try {
                File::link($storageDir, $publicEventsDir);
            } catch (\Throwable $e) {
                // Some environments (e.g. Windows, restricted containers) may not support symlinks.
                // Fallback to creating the directory to avoid runtime errors; files will still be served via route.
                File::ensureDirectoryExists($publicEventsDir);
            }
        }
    }
}
