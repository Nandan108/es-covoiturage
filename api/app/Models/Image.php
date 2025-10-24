<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\File;

/**
 * @property int         $id
 * @property string      $name
 * @property string|null $file
 */
final class Image extends Model
{
    /** @use HasFactory<\Database\Factories\ImageFactory> */
    use HasFactory;

    protected $fillable = ['name', 'file'];

    /** Directory where images are stored */
    public const string STORAGE_DIR = 'images';

    /**
     * Directory (relative to project public/) where images are publicly accessible.
     */
    public const string PUBLIC_DIR = 'images/events';

    /**
     * Ensure the image exists on disk under storage/images.
     */
    public function ensureStoredLocally(): void
    {
        $storagePath = $this->storagePath();
        if (File::exists($storagePath)) {
            return;
        }

        if (null === $this->file) {
            return;
        }

        File::ensureDirectoryExists(dirname($storagePath));
        File::put($storagePath, base64_decode($this->file));
    }

    /**
     * Return the absolute path to the stored image file.
     */
    public function storagePath(): string
    {
        return storage_path(self::STORAGE_DIR.DIRECTORY_SEPARATOR.$this->name);
    }

    /**
     * Build the public-facing path (relative to the app root) for the image.
     */
    public function publicPath(): string
    {
        return '/'.self::PUBLIC_DIR.'/'.$this->name;
    }
}
