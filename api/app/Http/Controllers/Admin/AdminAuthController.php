<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Contracts\Auth\StatefulGuard;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

/** @psalm-suppress UnusedClass */
final class AdminAuthController extends Controller
{
    public function login(Request $request): JsonResponse
    {
        $credentials = $request->validate([
            'email'    => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        /** @var StatefulGuard $guard */
        $guard = Auth::guard('admin');

        if ($guard->attempt($credentials + ['is_admin' => true], true)) {
            $request->session()->regenerate();

            /** @var User $admin */
            $admin = $guard->user();

            return response()->json([
                'message' => 'ok',
                'admin'   => [
                    'id'    => $admin->id,
                    'name'  => $admin->name,
                    'email' => $admin->email,
                ],
            ]);
        }

        return response()->json([
            'message' => 'Invalid credentials',
        ], 422);
    }

    public function logout(Request $request): JsonResponse
    {
        /** @var StatefulGuard $guard */
        $guard = Auth::guard('admin');
        $guard->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json(['message' => 'ok']);
    }

    public function me(): JsonResponse
    {
        $admin = Auth::guard('admin')->user();
        if (!$admin) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        return response()->json([
            'id'    => $admin->id,
            'name'  => $admin->name,
            'email' => $admin->email,
        ]);
    }
}
