<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\Image;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Validation\Rule;

class AdminEventController extends Controller
{
    public function index(): JsonResponse
    {
        $events = Event::query()
            ->withCount('offers')
            ->orderByDesc('start_date')
            ->get();

        return response()->json(['data' => $events]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $this->validatedData($request);
        $event = Event::create($data);
        $event->loadCount('offers');

        return response()->json(['data' => $event], 201);
    }

    public function show(Event $event): JsonResponse
    {
        $event->loadCount('offers');

        return response()->json(['data' => $event]);
    }

    public function update(Request $request, Event $event): JsonResponse
    {
        $data = $this->validatedData($request, $event);
        $event->update($data);
        $event->refresh()->loadCount('offers');

        return response()->json(['data' => $event]);
    }

    public function destroy(Event $event): JsonResponse
    {
        $event->delete();

        return response()->json(['message' => 'deleted']);
    }

    private function validatedData(Request $request, ?Event $event = null): array
    {
        $imgRequired = $event ? '' : '|required';

        $rawOriginalId = $request->input('original_event_id');
        $request->merge([
            'loc_original_link' => $request->string('loc_original_link')->trim()->toString() ?: null,
            'original_event_id' => (null === $rawOriginalId || '' === $rawOriginalId) ? null : (int) $rawOriginalId,
        ]);

        $data = $request->validate([
            'name'              => ['required', 'string', 'max:255'],
            'type'              => ['required', Rule::in(['retreat', 'seminar', 'silent-retreat'])],
            'start_date'        => ['required', 'date'],
            'days'              => ['required', 'integer', 'min:1'],
            'private'           => ['required', 'boolean'],
            'loc_name'          => ['nullable', 'string', 'max:255'],
            'loc_address'       => ['required', 'string', 'max:255'],
            'loc_lat'           => ['required', 'numeric', 'between:36,66'],
            'loc_lng'           => ['required', 'numeric', 'between:-175,18'],
            'loc_original_link' => ['nullable', 'url'],
            'original_event_id' => ['nullable', 'integer', 'min:1'],
            'image'             => ['sometimes', 'image', 'mimes:png,jpg,jpeg,webp', 'max:512000'.$imgRequired],
        ]);

        $imgFile = $request->file('image');
        if ($imgFile instanceof UploadedFile && $imgFile->isValid()) {
            $fileContents = $imgFile->get();
            $b64Image = base64_encode(false === $fileContents ? '' : $fileContents);
            /** @psalm-suppress UndefinedMagicMethod*/
            $image = Image::whereRaw('crc32(file) = ?', crc32($b64Image))->first();
            if (!$image) {
                $image = Image::create([
                    'name' => $imgFile->getClientOriginalName(),
                    'file' => $b64Image,
                ]);
                $image->ensureStoredLocally();
            }
            $data['image_id'] = $image->id;
        }

        return $data;
    }
}
