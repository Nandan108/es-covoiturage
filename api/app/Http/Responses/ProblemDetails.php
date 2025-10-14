<?php

namespace App\Http\Responses;

use Illuminate\Http\JsonResponse;

/**
 * @psalm-suppress UnusedClass // used in bootstrap/app.php
 */
final class ProblemDetails
{
    public static function from(
        string $type,
        string $title,
        int $status,
        ?string $detail = null,
        ?string $instance = null,
        array $extra = [],
    ): JsonResponse {
        $data = array_merge([
            'type'   => $type,
            'title'  => $title,
            'status' => $status,
        ], array_filter([
            'detail'   => $detail,
            'instance' => $instance,
        ]), $extra);

        return response()->json($data, $status, [
            'Content-Type' => 'application/problem+json',
        ]);
    }

    public static function fromException(\Throwable $e, ?string $instance = null): JsonResponse
    {
        $status = method_exists($e, 'getStatusCode') ? $e->getStatusCode() : 500;

        return self::from(
            type: 'about:blank',
            title: self::getTitleForStatus($status),
            status: $status,
            detail: $e->getMessage(),
            instance: $instance,
        );
    }

    protected static function getTitleForStatus(int $status): string
    {
        return match ($status) {
            400     => 'Bad Request',
            401     => 'Unauthorized',
            403     => 'Forbidden',
            404     => 'Not Found',
            405     => 'Method Not Allowed',
            422     => 'Unprocessable Entity',
            500     => 'Internal Server Error',
            default => 'Error',
        };
    }
}
