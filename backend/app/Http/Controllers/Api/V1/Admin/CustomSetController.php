<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreCustomSetRequest;
use App\Http\Requests\Admin\UpdateCustomSetRequest;
use App\Models\CustomQuestionSet;
use App\Services\CustomSetService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CustomSetController extends Controller
{
    public function __construct(private CustomSetService $service) {}

    public function index(): JsonResponse
    {
        return response()->json(['data' => $this->service->list()]);
    }

    public function store(StoreCustomSetRequest $request): JsonResponse
    {
        $set = $this->service->create(auth()->user(), $request->validated());

        return response()->json(['data' => $set], 201);
    }

    public function show(int $id): JsonResponse
    {
        $set = $this->service->findById($id);

        return response()->json(['data' => $this->formatDetail($set)]);
    }

    public function update(UpdateCustomSetRequest $request, int $id): JsonResponse
    {
        $set     = CustomQuestionSet::findOrFail($id);
        $updated = $this->service->update($set, $request->validated());

        return response()->json(['data' => $updated]);
    }

    public function destroy(int $id): JsonResponse
    {
        $set = CustomQuestionSet::findOrFail($id);
        $this->service->delete($set);

        return response()->json(null, 204);
    }

    public function addQuestion(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'question_id' => ['required', 'integer', 'exists:questions,id'],
        ]);

        $set = CustomQuestionSet::findOrFail($id);
        $this->service->addQuestion($set, $request->integer('question_id'));

        return response()->json(['data' => $this->formatDetail($this->service->findById($id))]);
    }

    public function removeQuestion(int $id, int $questionId): JsonResponse
    {
        $set = CustomQuestionSet::findOrFail($id);
        $this->service->removeQuestion($set, $questionId);

        return response()->json(null, 204);
    }

    public function createQuestion(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'text'              => ['required', 'string', 'max:5000'],
            'explanation'       => ['nullable', 'string', 'max:5000'],
            'choices'           => ['required', 'array', 'min:2', 'max:6'],
            'choices.*.text'    => ['required', 'string', 'max:500'],
            'choices.*.is_correct' => ['required', 'boolean'],
        ]);

        $set      = CustomQuestionSet::findOrFail($id);
        $question = $this->service->createAndAddQuestion($set, $request->all());

        return response()->json(['data' => [
            'id'          => $question->id,
            'text'        => $question->text,
            'category'    => $question->category,
            'explanation' => $question->explanation,
            'sort_order'  => DB::table('custom_set_questions')
                ->where('set_id', $id)
                ->where('question_id', $question->id)
                ->value('sort_order'),
            'choices'     => $question->choices->map(fn ($c) => [
                'id'         => $c->id,
                'text'       => $c->text,
                'is_correct' => $c->is_correct,
                'order'      => $c->order,
            ]),
        ]], 201);
    }

    public function reorder(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'question_ids'   => ['required', 'array'],
            'question_ids.*' => ['integer'],
        ]);

        $set = CustomQuestionSet::findOrFail($id);
        $this->service->reorder($set, $request->input('question_ids'));

        return response()->json(['data' => 'ok']);
    }

    public function results(int $id): JsonResponse
    {
        $set     = CustomQuestionSet::findOrFail($id);
        $results = $this->service->getResults($set);

        return response()->json(['data' => $results->map(fn ($r) => [
            'id'              => $r->id,
            'user'            => [
                'id'    => $r->user->id,
                'name'  => $r->user->name,
                'email' => $r->user->email,
            ],
            'score'           => $r->score,
            'total_questions' => $r->total_questions,
            'passing_score'   => $r->passing_score,
            'status'          => $r->status,
            'completed_at'    => $r->completed_at,
        ])]);
    }

    private function formatDetail(CustomQuestionSet $set): array
    {
        return [
            'id'                 => $set->id,
            'name'               => $set->name,
            'description'        => $set->description,
            'slug'               => $set->slug,
            'time_limit_seconds' => $set->time_limit_seconds,
            'passing_score'      => $set->passing_score,
            'is_active'          => $set->is_active,
            'questions'          => $set->questions->map(fn ($q) => [
                'id'          => $q->id,
                'text'        => $q->text,
                'category'    => $q->category,
                'explanation' => $q->explanation,
                'sort_order'  => $q->pivot->sort_order,
                'choices'     => $q->choices->map(fn ($c) => [
                    'id'         => $c->id,
                    'text'       => $c->text,
                    'is_correct' => $c->is_correct,
                    'order'      => $c->order,
                ])->values(),
            ])->values(),
        ];
    }
}
