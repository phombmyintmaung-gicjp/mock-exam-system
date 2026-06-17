<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\ExamResult;
use Illuminate\Http\JsonResponse;

class ResultAdminController extends Controller
{
    public function index(): JsonResponse
    {
        $paginator = ExamResult::with(['session', 'user'])
            ->orderByDesc('completed_at')
            ->paginate(perPage: 20);

        return response()->json([
            'data'     => $paginator->items(),
            'count'    => $paginator->total(),
            'next'     => $paginator->nextPageUrl(),
            'previous' => $paginator->previousPageUrl(),
        ]);
    }
}
