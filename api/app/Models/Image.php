<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * @property int    $id
 * @property string $name
 * @property string $file
 */
final class Image extends Model
{
    protected $fillable = ['name', 'file'];
}
