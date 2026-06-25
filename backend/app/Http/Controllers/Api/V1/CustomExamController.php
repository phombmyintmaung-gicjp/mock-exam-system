<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\CustomExamResult;
use App\Models\CustomExamSession;
use App\Services\CustomSetService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CustomExamController extends Controller
{
    public function __construct(private CustomSetService $service) {}

    public function show(string $slug): JsonResponse
    {
        $set = $this->service->findBySlug($slug);

        return response()->json(['data' => [
            'id'                 => $set->id,
            'name'               => $set->name,
            'description'        => $set->description,
            'slug'               => $set->slug,
            'time_limit_seconds' => $set->time_limit_seconds,
            'passing_score'      => $set->passing_score,
            'question_count'     => $set->questions->count(),
        ]]);
    }

    public function startSession(string $slug): JsonResponse
    {
        $set  = $this->service->findBySlug($slug);
        $user = auth()->user();

        try {
            $session = $this->service->startSession($set, $user);
        } catch (\Symfony\Component\HttpKernel\Exception\HttpException $e) {
            return response()->json(['error' => $e->getMessage()], $e->getStatusCode());
        }

        $questions = $set->questions->map(fn ($q) => [
            'id'          => $q->id,
            'text'        => $q->text,
            'category'    => $q->category,
            'explanation' => $q->explanation,
            'choices'     => $q->choices->map(fn ($c) => [
                'id'   => $c->id,
                'text' => $c->text,
            ])->values(),
        ])->values();

        return response()->json(['data' => [
            'session'   => [
                'id'                 => $session->id,
                'set_id'             => $set->id,
                'set_name'           => $set->name,
                'time_limit_seconds' => $set->time_limit_seconds,
                'passing_score'      => $set->passing_score,
            ],
            'questions' => $questions,
        ]], 201);
    }

    public function submitSession(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'answers'               => ['required', 'array'],
            'answers.*.question_id' => ['required', 'integer', 'exists:questions,id'],
            'answers.*.choice_id'   => ['nullable', 'integer', 'exists:choices,id'],
            'submitted_by'              => ['nullable', 'string', 'in:manual,timeout,violation'],
            'violation_log'             => ['nullable', 'array'],
            'violation_log.*.type'      => ['required_with:violation_log', 'string'],
            'violation_log.*.timestamp' => ['required_with:violation_log', 'string'],
        ]);

        $user    = auth()->user();
        $session = CustomExamSession::where('user_id', $user->id)->findOrFail($id);

        if ($session->is_submitted) {
            return response()->json(['error' => 'Session already submitted.'], 422);
        }

        $submittedBy  = $request->input('submitted_by', 'manual');
        $violationLog = $request->input('violation_log', []);
        $result = $this->service->submitSession($session, $request->input('answers'), $submittedBy, $violationLog);

        return response()->json(['data' => [
            'id'              => $result->id,
            'set_id'          => $result->set_id,
            'score'           => $result->score,
            'total_questions' => $result->total_questions,
            'passing_score'   => $result->passing_score,
            'status'          => $result->status,
            'completed_at'    => $result->completed_at,
        ]]);
    }

    public function myResults(string $slug): JsonResponse
    {
        $set  = $this->service->findBySlug($slug);
        $user = auth()->user();

        $results = \App\Models\CustomExamResult::where('set_id', $set->id)
            ->where('user_id', $user->id)
            ->orderByDesc('completed_at')
            ->get();

        return response()->json(['data' => $results->map(fn ($r) => [
            'id'              => $r->id,
            'score'           => $r->score,
            'total_questions' => $r->total_questions,
            'passing_score'   => $r->passing_score,
            'status'          => $r->status,
            'completed_at'    => $r->completed_at,
        ])]);
    }

    public function getResult(int $id): JsonResponse
    {
        $user   = auth()->user();
        $result = CustomExamResult::with('set')
            ->where('user_id', $user->id)
            ->findOrFail($id);

        // Answer details are intentionally omitted from the employee-facing result
        // to prevent answer leakage between participants. Admins access the full
        // breakdown via GET /admin/custom-sets/{setId}/results/{resultId}.
        return response()->json(['data' => [
            'id'              => $result->id,
            'set_id'          => $result->set_id,
            'set_name'        => $result->set->name,
            'score'           => $result->score,
            'total_questions' => $result->total_questions,
            'passing_score'   => $result->passing_score,
            'status'          => $result->status,
            'completed_at'    => $result->completed_at,
        ]]);
    }
}
