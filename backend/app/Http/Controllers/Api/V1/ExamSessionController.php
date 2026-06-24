<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Exam\StartSessionRequest;
use App\Models\ExamSetting;
use App\Services\ExamService;
use App\Services\ResultService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ExamSessionController extends Controller
{
    public function __construct(
        private readonly ExamService   $examService,
        private readonly ResultService $resultService
    ) {}

    /**
     * @OA\Post(
     *     path="/exams/sessions",
     *     tags={"Exams"},
     *     summary="Start a new exam session",
     *     operationId="startSession",
     *     security={{"bearerAuth":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"category","mode"},
     *             @OA\Property(property="category", type="string", example="AWS SAA"),
     *             @OA\Property(property="mode", type="string", enum={"exam","study"}),
     *             @OA\Property(property="question_count", type="integer", example=20),
     *             @OA\Property(property="time_limit_seconds", type="integer", example=3600, description="0 = no limit")
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Session created",
     *         @OA\JsonContent(
     *             @OA\Property(property="data", type="object",
     *                 @OA\Property(property="session", type="object"),
     *                 @OA\Property(property="questions", type="array", @OA\Items(type="object"))
     *             )
     *         )
     *     ),
     *     @OA\Response(response=422, description="Validation error")
     * )
     */
    public function store(StartSessionRequest $request): JsonResponse
    {
        /** @var \App\Models\User $user */
        $user = auth()->user();

        $data    = $request->validated();
        $setting = ExamSetting::where('category', $data['category'])->first();

        // Apply per-category defaults when values are not explicitly sent by client.
        $data['time_limit_seconds'] ??= $setting?->time_limit_seconds ?? config('exam.default_time_limit', 3600);

        $session = $this->examService->createSession($user, $data);

        $questionCount = (int) ($data['question_count'] ?? $setting?->question_count ?? 20);
        $questionTypes = $data['question_types'] ?? [];
        $questions     = $this->examService->getSessionQuestions($session, $questionCount, $questionTypes);

        // Merge actual question_count back onto the session payload so the frontend
        // always knows the real pool size (may differ from the ExamSetting value
        // when a sub-section filter is active or the DB has fewer questions).
        $sessionData = array_merge($session->toArray(), [
            'question_count' => $questions->count(),
        ]);

        return response()->json([
            'data' => [
                'session'   => $sessionData,
                'questions' => $questions,
            ],
        ], 201);
    }

    /**
     * @OA\Post(
     *     path="/exams/sessions/{id}/submit",
     *     tags={"Exams"},
     *     summary="Submit answers and get the exam result",
     *     operationId="submitSession",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer"), description="Session ID"),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"answers"},
     *             @OA\Property(property="answers", type="array", @OA\Items(type="object",
     *                 @OA\Property(property="question_id", type="integer"),
     *                 @OA\Property(property="choice_id", type="integer", nullable=true),
     *                 @OA\Property(property="time_taken_seconds", type="integer", nullable=true)
     *             ))
     *         )
     *     ),
     *     @OA\Response(response=200, description="Result with answer records",
     *         @OA\JsonContent(@OA\Property(property="data", type="object"))
     *     ),
     *     @OA\Response(response=422, description="Already submitted or validation error")
     * )
     */
    public function submit(Request $request, int $id): JsonResponse
    {
        /** @var \App\Models\User $user */
        $user = auth()->user();

        $request->validate([
            'answers'                       => ['required', 'array'],
            'answers.*.question_id'         => ['required', 'integer', 'exists:questions,id'],
            'answers.*.choice_id'           => ['nullable', 'integer', 'exists:choices,id'],
            'answers.*.time_taken_seconds'  => ['nullable', 'integer', 'min:0'],
        ]);

        $session = $user->examSessions()->findOrFail($id);

        if ($session->is_submitted) {
            return response()->json(['error' => 'This session has already been submitted.'], 422);
        }

        // Server-side time limit enforcement — 120 s grace for network latency / UI processing.
        // Study sessions (time_limit_seconds = 0) are never expired.
        $timeLimitSeconds = (int) $session->time_limit_seconds;
        if ($timeLimitSeconds > 0) {
            $elapsed = now()->diffInSeconds($session->created_at);
            if ($elapsed > $timeLimitSeconds + 120) {
                return response()->json(['error' => 'Time limit exceeded. The session has expired.'], 422);
            }
        }

        $categorySetting = ExamSetting::where('category', $session->category)->first();
        $passingScore    = $categorySetting?->passing_score ?? config('exam.passing_score', 70);

        $result = $this->resultService->calculate(
            session: $session,
            answers: $request->input('answers'),
            passingScore: $passingScore
        );

        return response()->json(['data' => $result->load('answerRecords')]);
    }
}
