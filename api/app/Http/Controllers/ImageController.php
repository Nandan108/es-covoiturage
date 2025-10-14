<?php

namespace App\Http\Controllers;

use App\Models\Image;
use Illuminate\Http\Request;

/** @psalm-suppress UnusedClass */
final class ImageController extends Controller
{
    /**
     * Store a newly created resource in storage.
     *
     * @psalm-suppress PossiblyUnusedMethod
     */
    public function store(Request $request)
    {
        $request->validate([
            'image' => 'required|image|mimes:png,jpg,jpeg,webp|max:2048',
        ]);

        $imageName = time().'.'.$request->image->extension();

        // Public Folder
        $request->image->move(public_path('images'), $imageName);

        return back()->with('success', 'Image uploaded Successfully!')
            ->with('image', $imageName);
    }

    /**
     * Display the specified resource.
     *
     * @psalm-suppress PossiblyUnusedMethod
     */
    public function show(Image $image)
    {
        $file = base64_decode($image->file);
        header('Content-type: image/jpeg', true, 200);
        exit($file);
    }
}
