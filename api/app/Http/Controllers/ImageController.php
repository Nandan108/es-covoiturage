<?php

namespace App\Http\Controllers;

use App\Models\Image;
use Illuminate\Http\Request;

class ImageController extends Controller
{
    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'image' => 'required|image|mimes:png,jpg,jpeg,webp|max:2048',
        ]);

        $imageName = time() . '.' . $request->image->extension();

        // Public Folder
        $request->image->move(public_path('images'), $imageName);

        // //Store in Storage Folder
        // $request->image->storeAs('images', $imageName);

        // // Store in S3
        // $request->image->storeAs('images', $imageName, 's3');

        //Store IMage in DB


        return back()->with('success', 'Image uploaded Successfully!')
            ->with('image', $imageName);
    }


    /**
     * Display the specified resource.
     */
    public function show(Image $image)
    {
        $file = base64_decode($image->file);
        header('Content-type: image/jpeg', true, 200);
        die($file);
    }
}
