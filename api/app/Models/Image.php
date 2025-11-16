<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * @property int    $id
 * @property string $name
 * @property int    $crc32
 */
final class Image extends Model
{
    /** @use HasFactory<\Database\Factories\ImageFactory> */
    use HasFactory;

    protected $fillable = ['name', 'crc32'];

    /** Directory where images are stored */
    public const string STORAGE_DIR = 'images';

    /**
     * Directory (relative to project public/) where images are publicly accessible.
     */
    public const string PUBLIC_DIR = 'images/events';

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
