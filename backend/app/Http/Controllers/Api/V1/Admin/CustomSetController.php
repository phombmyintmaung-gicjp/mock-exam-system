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
use PhpOffice\PhpSpreadsheet\IOFactory;

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
        $results->load('session');

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
            'submitted_by'    => $r->session?->submitted_by ?? 'manual',
        ])]);
    }

    public function showResult(int $setId, int $resultId): JsonResponse
    {
        $result = \App\Models\CustomExamResult::with([
            'user',
            'session',
            'answerRecords.question.choices',
            'answerRecords.selectedChoice',
        ])->where('set_id', $setId)->findOrFail($resultId);

        return response()->json(['data' => [
            'id'              => $result->id,
            'set_id'          => $result->set_id,
            'submitted_by'    => $result->session?->submitted_by ?? 'manual',
            'violation_log'   => $result->session?->violation_log ?? [],
            'user'            => [
                'id'    => $result->user->id,
                'name'  => $result->user->name,
                'email' => $result->user->email,
            ],
            'score'           => $result->score,
            'total_questions' => $result->total_questions,
            'passing_score'   => $result->passing_score,
            'status'          => $result->status,
            'completed_at'    => $result->completed_at,
            'answer_records'  => $result->answerRecords->map(fn ($ar) => [
                'question_id'        => $ar->question_id,
                'question_text'      => $ar->question?->text ?? '',
                'explanation'        => $ar->question?->explanation,
                'is_correct'         => (bool) $ar->is_correct,
                'selected_choice_id' => $ar->selected_choice_id,
                'choices'            => $ar->question
                    ? $ar->question->choices->sortBy('order')->map(fn ($c) => [
                        'id'         => $c->id,
                        'text'       => $c->text,
                        'is_correct' => (bool) $c->is_correct,
                    ])->values()
                    : collect(),
            ])->values(),
        ]]);
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

    public function importFromExcel(Request $request): JsonResponse
    {
        $request->validate([
            'file'               => ['required', 'file', 'mimes:xlsx,xls', 'max:10240'],
            'name'               => ['required', 'string', 'max:200'],
            'slug'               => ['nullable', 'string', 'max:100', 'regex:/^[a-zA-Z0-9_-]+$/', 'unique:custom_question_sets,slug'],
            'time_limit_minutes' => ['required', 'integer', 'min:0', 'max:300'],
            'passing_score'      => ['required', 'integer', 'min:1', 'max:100'],
            'description'        => ['nullable', 'string', 'max:500'],
            'is_active'          => ['nullable', 'boolean'],
        ]);

        $rows     = $this->parseQuestionRows($request->file('file')->getRealPath());
        $imported = 0;
        $errors   = [];

        $set = $this->service->create(auth()->user(), [
            'name'               => $request->input('name'),
            'description'        => $request->input('description'),
            'slug'               => $request->input('slug') ?: null,
            'time_limit_seconds' => (int) $request->input('time_limit_minutes') * 60,
            'passing_score'      => (int) $request->input('passing_score'),
            'is_active'          => $request->boolean('is_active', true),
        ]);

        foreach ($rows as $row) {
            $lineNum = $row['line'];

            if (count($row['choices']) < 2) {
                $errors[] = "Row {$lineNum}: at least 2 choices required (choice1 and choice2).";
                continue;
            }

            $hasCorrect = collect($row['choices'])->contains('is_correct', true);
            if (!$hasCorrect) {
                $errors[] = "Row {$lineNum}: correct_index must match a non-empty choice (1–" . count($row['choices']) . ").";
                continue;
            }

            try {
                $this->service->createAndAddQuestion($set, [
                    'text'        => $row['text'],
                    'explanation' => $row['explanation'] ?: null,
                    'choices'     => $row['choices'],
                ]);
                $imported++;
            } catch (\Throwable $e) {
                $errors[] = "Row {$lineNum}: " . $e->getMessage();
            }
        }

        $set->load('questions.choices');

        return response()->json([
            'data' => [
                'set'      => $this->formatDetail($set),
                'imported' => $imported,
                'skipped'  => count($errors),
                'errors'   => $errors,
            ],
        ], 201);
    }

    private function parseQuestionRows(string $path): array
    {
        $spreadsheet = IOFactory::load($path);
        $sheet       = $spreadsheet->getActiveSheet();
        $data        = $sheet->toArray(nullValue: '', calculateFormulas: false, formatData: false);

        if (empty($data)) {
            return [];
        }

        $rawHeader = array_shift($data);
        $header    = array_map(fn ($h) => strtolower(trim((string) $h)), $rawHeader);
        $col       = array_flip($header);

        foreach (['text', 'choice1', 'choice2', 'correct_index'] as $required) {
            if (!isset($col[$required])) {
                return [];
            }
        }

        $rows = [];
        foreach ($data as $index => $row) {
            $text = trim((string) ($row[$col['text']] ?? ''));
            if ($text === '') {
                continue;
            }

            $correctIndex = (int) ($row[$col['correct_index']] ?? 0);
            $choices      = [];
            for ($i = 1; $i <= 4; $i++) {
                $key = "choice{$i}";
                $ct  = isset($col[$key]) ? trim((string) ($row[$col[$key]] ?? '')) : '';
                if ($ct === '') {
                    continue;
                }
                $choices[] = ['text' => $ct, 'is_correct' => $correctIndex === $i];
            }

            $explCol     = $col['explanation'] ?? null;
            $explanation = $explCol !== null ? trim((string) ($row[$explCol] ?? '')) : '';

            $rows[] = [
                'line'        => $index + 2,
                'text'        => $text,
                'explanation' => $explanation,
                'choices'     => $choices,
            ];
        }

        return $rows;
    }
}
