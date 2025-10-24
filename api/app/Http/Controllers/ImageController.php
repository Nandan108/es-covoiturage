<?php

namespace App\Http\Controllers;

use App\Models\Image;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\File;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

/** @psalm-suppress UnusedClass */
final class ImageController extends Controller
{
    /**
     * Store a newly created resource in storage.
     *
     * @psalm-suppress PossiblyUnusedMethod
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'image' => 'required|image|mimes:png,jpg,jpeg,webp|max:2048',
        ]);

        $imageName = time().'.'.$request->image->extension();

        $targetDir = storage_path(Image::STORAGE_DIR);
        File::ensureDirectoryExists($targetDir);
        $request->image->move($targetDir, $imageName);

        return back()->with('success', 'Image uploaded Successfully!')
            ->with('image', $imageName);
    }

    /**
     * Display the specified resource.
     *
     * @psalm-suppress PossiblyUnusedMethod
     */
    public function show(Image $image): BinaryFileResponse|Response
    {
        $image->ensureStoredLocally();
        $path = $image->storagePath();

        if (File::exists($path)) {
            return response()->file($path, [
                'Cache-Control' => 'public, max-age=31536000, immutable',
            ]);
        }

        if (null !== $image->file) {
            return new Response(base64_decode($image->file), 200, [
                'Content-Type'  => 'image/jpeg',
                'Cache-Control' => 'no-store',
            ]);
        }

        abort(404);
    }
}
