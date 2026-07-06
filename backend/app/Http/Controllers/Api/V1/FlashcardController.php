<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\FlashcardService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FlashcardController extends Controller
{
    public function __construct(private FlashcardService $service) {}

    public function index(Request $request): JsonResponse
    {
        $levels = $request->query('level') ? explode(',', $request->query('level')) : [];

        $paginator = $this->service->list(
            $request->query('type'),
            $levels,
        );
        return response()->json([
            'data'     => $paginator->items(),
            'count'    => $paginator->total(),
            'next'     => $paginator->nextPageUrl(),
            'previous' => $paginator->previousPageUrl(),
        ]);
    }
}
