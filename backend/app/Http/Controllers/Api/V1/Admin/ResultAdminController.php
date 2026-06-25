<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\ExamResult;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ResultAdminController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = ExamResult::with(['session', 'user'])
            ->orderByDesc('completed_at');

        if ($search = $request->query('search')) {
            $query->whereHas('user', fn ($q) =>
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
            );
        }

        if ($category = $request->query('category')) {
            $query->whereHas('session', fn ($q) =>
                $q->where('category', $category)
            );
        }

        $paginator = $query->paginate(perPage: 20);

        return response()->json([
            'data'     => $paginator->items(),
            'count'    => $paginator->total(),
            'next'     => $paginator->nextPageUrl(),
            'previous' => $paginator->previousPageUrl(),
        ]);
    }

    public function show(int $id): JsonResponse
    {
        $result = ExamResult::with([
            'session',
            'user',
            'answerRecords.question.choices',
            'answerRecords.selectedChoice',
        ])->findOrFail($id);

        return response()->json(['data' => $result]);
    }
}
