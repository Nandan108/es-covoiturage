<?php

namespace App\Http\Controllers;

use App\Mail\ContactMessageMail;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

/** @psalm-suppress UnusedClass */
final class ContactController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name'    => ['required', 'string', 'max:100'],
            'email'   => ['required', 'string', 'email', 'max:255'],
            'message' => ['required', 'string', 'max:2000'],
        ]);

        $recipient = (string) config('services.contact.email');
        if ('' === $recipient) {
            return response()->json(['message' => 'Contact address not configured'], 503);
        }

        Mail::to($recipient)->send(new ContactMessageMail(
            $data['name'],
            $data['email'],
            $data['message']
        ));

        return response()->json(['message' => 'Message sent']);
    }
}
