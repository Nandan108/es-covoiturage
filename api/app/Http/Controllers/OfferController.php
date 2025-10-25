<?php

namespace App\Http\Controllers;

use App\Http\Responses\ProblemDetails;
use App\Mail\OfferAccessMail;
use App\Models\Event;
use App\Models\Offer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

/** @psalm-suppress UnusedClass */
final class OfferController extends Controller
{
    private function validateForm(Request $request, bool $patch = false): array
    {
        $required = $patch ? 'sometimes|' : 'required|';

        $data = $request->validate([
            'name'  => 'string|min:3|max:50',
            'email' => "{$required}email",
            'notes' => 'nullable|string|max:500',
            // 'email_is_public' => "{$required}boolean",
            'phone'        => 'regex:/^\+?[-.()\d ]+$/',
            'driver_seats' => "{$required}int|min:0",
            'pasngr_seats' => "{$required}int|min:0|max:10",
            // 'driver_seats|pasngr_seats' => "{$required}gt:0:Please specify at least one seat",
            'address' => "{$required}string|max:255",
            // latitude and longitude are valid from Canada to Italy
            'lat'             => "{$required}numeric|between:36,66",
            'lng'             => "{$required}numeric|between:-175,18",
            'email_is_public' => 'sometimes|boolean',
        ]);

        // $data['role'] = implode(',', $data['role']);

        return $data;
    }

    /**
     * Store a newly created resource in storage.
     *
     * @psalm-suppress PossiblyUnusedMethod
     */
    public function store(Event $event, Request $request): JsonResponse
    {
        $data = $this->validateForm($request);

        /** @var Offer $offer */
        $offer = $event->offers()->create($data);
        $expiresAt = $event->endDate();
        $token = $offer->issueOwnerToken($expiresAt);

        $payload = $offer->toArray();
        unset($payload['event_id']);
        $payload['eventHash'] = $event->hashId;

        $frontendUrl = rtrim((string) config('app.frontend_url', config('app.url')), '/');
        Mail::to($offer->email)->send(
            new OfferAccessMail(
                $event,
                $offer,
                $token,
                $frontendUrl,
                $expiresAt->toIso8601String()
            )
        );

        return response()->json([
            'message'    => 'Offer created successfully',
            'offer'      => $payload,
            'edit_token' => $token,
            'expires_at' => $expiresAt->toIso8601String(),
        ], 201);
    }

    /**
     * Display the specified resource.
     *
     * @psalm-suppress PossiblyUnusedMethod
     */
    public function show(Offer $offer): JsonResponse
    {
        return response()->json([
            'offer'   => $offer,
        ], 200);
    }

    /**
     * Update the specified resource in storage.
     *
     * @psalm-suppress PossiblyUnusedMethod
     */
    public function update(Event $event, Offer $offer, Request $request): JsonResponse
    {
        if ($event->id !== $offer->event_id) {
            return response()->json([
                'message' => 'Offer does not belong to the specified event',
            ], 400);
        }

        if ($response = $this->validateOfferToken($request, $offer)) {
            return $response;
        }

        $data = $this->validateForm($request, patch: true);
        $offer->update($data);

        $response = response()->json([
            'message' => 'Offer updated successfully',
            'offer'   => $offer,
        ], 200);

        return $response;
    }

    /**
     * Remove the specified resource from storage.
     *
     * @psalm-suppress PossiblyUnusedMethod
     */
    public function destroy(Event $event, Offer $offer, Request $request): JsonResponse
    {
        if ($event->id !== $offer->event_id) {
            return response()->json(['message' => 'Offer does not belong to the specified event'], 400);
        }

        if ($response = $this->validateOfferToken($request, $offer)) {
            return $response;
        }

        $result = $offer->delete() ? ['deleted successfully', 200] : ['not deleted', 500];

        return response()->json(['message' => 'Offer '.$result[0]], $result[1]);
    }

    private function validateOfferToken(Request $request, Offer $offer): ?JsonResponse
    {
        $token = $request->header('X-Offer-Token') ?? $request->input('token');
        if ($offer->tokenIsValid($token)) {
            return null;
        }

        return ProblemDetails::from(
            type: 'about:blank',
            title: 'Forbidden',
            status: 403,
            detail: 'A valid owner token is required to modify this offer.',
            instance: $request->path(),
        );
    }
}
