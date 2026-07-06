<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\AnalyticsService;
use Illuminate\Http\JsonResponse;

class AnalyticsController extends Controller
{
    public function __construct(
        private readonly AnalyticsService $analyticsService
    ) {}

    /**
     * @OA\Get(
     *     path="/analytics/category-stats",
     *     tags={"Analytics"},
     *     summary="Pass/fail counts grouped by exam category (all users)",
     *     operationId="categoryStats",
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(response=200, description="Category statistics",
     *         @OA\JsonContent(
     *             @OA\Property(property="data", type="array", @OA\Items(type="object",
     *                 @OA\Property(property="category", type="string"),
     *                 @OA\Property(property="pass", type="integer"),
     *                 @OA\Property(property="fail", type="integer")
     *             ))
     *         )
     *     )
     * )
     */
    public function categoryStats(): JsonResponse
    {
        $stats = $this->analyticsService->getCategoryStats();

        return response()->json(['data' => $stats]);
    }

    /**
     * @OA\Get(
     *     path="/analytics/weak-areas",
     *     tags={"Analytics"},
     *     summary="Per-category accuracy for the current user",
     *     operationId="weakAreas",
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(response=200, description="Weak areas by category",
     *         @OA\JsonContent(
     *             @OA\Property(property="data", type="array", @OA\Items(type="object",
     *                 @OA\Property(property="category", type="string"),
     *                 @OA\Property(property="accuracy", type="number", format="float")
     *             ))
     *         )
     *     )
     * )
     */
    public function weakAreas(): JsonResponse
    {
        /** @var \App\Models\User $user */
        $user = auth()->user();

        $areas = $this->analyticsService->getWeakAreas($user);

        return response()->json(['data' => $areas]);
    }

    /**
     * @OA\Get(
     *     path="/analytics/score-trend",
     *     tags={"Analytics"},
     *     summary="Score history over time for the current user",
     *     operationId="scoreTrend",
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(response=200, description="Score trend",
     *         @OA\JsonContent(
     *             @OA\Property(property="data", type="array", @OA\Items(type="object",
     *                 @OA\Property(property="completed_at", type="string", format="date-time"),
     *                 @OA\Property(property="score", type="integer"),
     *                 @OA\Property(property="total_questions", type="integer")
     *             ))
     *         )
     *     )
     * )
     */
    public function scoreTrend(): JsonResponse
    {
        /** @var \App\Models\User $user */
        $user = auth()->user();

        $trend = $this->analyticsService->getScoreTrend($user);

        return response()->json(['data' => $trend]);
    }

    public function retryStats(): JsonResponse
    {
        /** @var \App\Models\User $user */
        $user = auth()->user();

        $stats = $this->analyticsService->getRetryStats($user);

        return response()->json(['data' => $stats]);
    }

    public function difficultQuestions(): JsonResponse
    {
        $questions = $this->analyticsService->getDifficultQuestions();

        return response()->json(['data' => $questions]);
    }

    /**
     * Return how many times each question has been answered incorrectly, aggregated across
     * all users. Read-only, employee-facing (not admin-only, unlike difficultQuestions()).
     */
    public function incorrectCounts(): JsonResponse
    {
        $stats = $this->analyticsService->getIncorrectCountsByCategory();

        return response()->json(['data' => $stats]);
    }
}
