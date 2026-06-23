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
        $set     = $this->service->findBySlug($slug);
        $user    = auth()->user();
        $session = $this->service->startSession($set, $user);

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
        ]);

        $user    = auth()->user();
        $session = CustomExamSession::where('user_id', $user->id)->findOrFail($id);

        if ($session->is_submitted) {
            return response()->json(['error' => 'Session already submitted.'], 422);
        }

        $result = $this->service->submitSession($session, $request->input('answers'));

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

    public function getResult(int $id): JsonResponse
    {
        $user   = auth()->user();
        $result = CustomExamResult::with(['set', 'answerRecords.question.choices'])
            ->where('user_id', $user->id)
            ->findOrFail($id);

        return response()->json(['data' => [
            'id'              => $result->id,
            'set_id'          => $result->set_id,
            'set_name'        => $result->set->name,
            'score'           => $result->score,
            'total_questions' => $result->total_questions,
            'passing_score'   => $result->passing_score,
            'status'          => $result->status,
            'completed_at'    => $result->completed_at,
            'answer_records'  => $result->answerRecords->map(fn ($ar) => [
                'question_id'        => $ar->question_id,
                'question_text'      => $ar->question->text,
                'explanation'        => $ar->question->explanation,
                'is_correct'         => $ar->is_correct,
                'selected_choice_id' => $ar->selected_choice_id,
                'choices'            => $ar->question->choices->map(fn ($c) => [
                    'id'         => $c->id,
                    'text'       => $c->text,
                    'is_correct' => $c->is_correct,
                ])->values(),
            ])->values(),
        ]]);
    }
}
