<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\ExamResult;
use Illuminate\Http\JsonResponse;

class ResultController extends Controller
{
    /**
     * @OA\Get(
     *     path="/results",
     *     tags={"Results"},
     *     summary="List the current user's past exam results",
     *     operationId="listResults",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="page", in="query", required=false, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Paginated results",
     *         @OA\JsonContent(
     *             @OA\Property(property="data", type="array", @OA\Items(type="object")),
     *             @OA\Property(property="count", type="integer"),
     *             @OA\Property(property="next", type="string", nullable=true),
     *             @OA\Property(property="previous", type="string", nullable=true)
     *         )
     *     ),
     *     @OA\Response(response=401, description="Unauthenticated")
     * )
     */
    public function index(): JsonResponse
    {
        /** @var \App\Models\User $user */
        $user = auth()->user();

        $paginator = ExamResult::where('user_id', $user->id)
            ->with('session')
            ->orderByDesc('completed_at')
            ->paginate(perPage: 15);

        return response()->json([
            'data'     => $paginator->items(),
            'count'    => $paginator->total(),
            'next'     => $paginator->nextPageUrl(),
            'previous' => $paginator->previousPageUrl(),
        ]);
    }

    /**
     * @OA\Get(
     *     path="/results/{id}",
     *     tags={"Results"},
     *     summary="Get a single result with answer records",
     *     operationId="showResult",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Result detail",
     *         @OA\JsonContent(@OA\Property(property="data", type="object"))
     *     ),
     *     @OA\Response(response=404, description="Not found")
     * )
     */
    public function show(int $id): JsonResponse
    {
        /** @var \App\Models\User $user */
        $user = auth()->user();

        $result = ExamResult::where('user_id', $user->id)
            ->with([
                'session',
                'answerRecords.question.choices',
                'answerRecords.selectedChoice',
            ])
            ->findOrFail($id);

        return response()->json(['data' => $result]);
    }

    /**
     * @OA\Get(
     *     path="/results/{id}/export",
     *     tags={"Results"},
     *     summary="Export a result as PDF (stub — returns JSON until dompdf is integrated)",
     *     operationId="exportResult",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Result data (or PDF blob when dompdf is integrated)"),
     *     @OA\Response(response=404, description="Not found")
     * )
     *
     * Export a result as PDF.
     *
     * NOTE: Full PDF generation requires a library such as barryvdh/laravel-dompdf.
     * This stub returns the result data as JSON. To enable PDF export:
     *   1. composer require barryvdh/laravel-dompdf
     *   2. Create a Blade view at resources/views/pdf/result.blade.php
     *   3. Replace the JSON response below with:
     *      $pdf = Pdf::loadView('pdf.result', ['result' => $result]);
     *      return $pdf->download("result-{$id}.pdf");
     */
    public function export(int $id): JsonResponse
    {
        /** @var \App\Models\User $user */
        $user = auth()->user();

        $result = ExamResult::where('user_id', $user->id)
            ->with([
                'session',
                'answerRecords.question.choices',
                'answerRecords.selectedChoice',
            ])
            ->findOrFail($id);

        // Stub: return JSON until a PDF library is integrated.
        return response()->json([
            'data' => $result,
            'meta' => [
                'note' => 'PDF export requires barryvdh/laravel-dompdf. See ResultController@export.',
            ],
        ]);
    }
}
