<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreQuestionRequest;
use App\Http\Requests\Admin\UpdateQuestionRequest;
use App\Models\Category;
use App\Models\Choice;
use App\Models\Question;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use PhpOffice\PhpSpreadsheet\IOFactory;

class QuestionAdminController extends Controller
{
    /**
     * @OA\Get(
     *     path="/admin/questions",
     *     tags={"Admin — Questions"},
     *     summary="List all questions",
     *     operationId="adminListQuestions",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="category", in="query", required=false, @OA\Schema(type="string")),
     *     @OA\Parameter(name="with_trashed", in="query", required=false, @OA\Schema(type="boolean"), description="Include soft-deleted questions"),
     *     @OA\Parameter(name="page", in="query", required=false, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Paginated questions",
     *         @OA\JsonContent(
     *             @OA\Property(property="data", type="array", @OA\Items(type="object")),
     *             @OA\Property(property="count", type="integer"),
     *             @OA\Property(property="next", type="string", nullable=true),
     *             @OA\Property(property="previous", type="string", nullable=true)
     *         )
     *     ),
     *     @OA\Response(response=403, description="Forbidden — admin only")
     * )
     */
    public function index(Request $request): JsonResponse
    {
        $query = Question::with('choices');

        if ($request->filled('category')) {
            $query->byCategory($request->string('category')->toString());
        } elseif ($request->filled('group')) {
            // group=jlpt → JLPT-* categories; group=it → everything else
            if ($request->input('group') === 'jlpt') {
                $query->where('category', 'LIKE', 'JLPT-%');
            } elseif ($request->input('group') === 'it') {
                $query->where('category', 'NOT LIKE', 'JLPT-%');
            }
        }

        if ($request->boolean('with_trashed')) {
            $query->withTrashed();
        }

        $perPage = min((int) $request->input('per_page', 25), 500);
        $paginator = $query->paginate(perPage: $perPage);

        return response()->json([
            'data'     => $paginator->items(),
            'count'    => $paginator->total(),
            'next'     => $paginator->nextPageUrl(),
            'previous' => $paginator->previousPageUrl(),
        ]);
    }

    /**
     * @OA\Post(
     *     path="/admin/questions",
     *     tags={"Admin — Questions"},
     *     summary="Create a question with choices",
     *     operationId="adminStoreQuestion",
     *     security={{"bearerAuth":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"text","category","explanation","choices"},
     *             @OA\Property(property="text", type="string"),
     *             @OA\Property(property="category", type="string"),
     *             @OA\Property(property="explanation", type="string"),
     *             @OA\Property(property="choices", type="array", @OA\Items(type="object",
     *                 @OA\Property(property="text", type="string"),
     *                 @OA\Property(property="is_correct", type="boolean"),
     *                 @OA\Property(property="order", type="integer")
     *             ))
     *         )
     *     ),
     *     @OA\Response(response=201, description="Question created",
     *         @OA\JsonContent(@OA\Property(property="data", type="object"))
     *     ),
     *     @OA\Response(response=422, description="Validation error")
     * )
     */
    public function store(StoreQuestionRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $question = DB::transaction(function () use ($validated): Question {
            $category = Category::findOrFail($validated['category_id']);

            /** @var Question $question */
            $question = Question::create([
                'text'          => $validated['text'],
                'category'      => $category->name,
                'category_id'   => $category->id,
                'question_type' => $validated['question_type'] ?? null,
                'explanation'   => $validated['explanation'],
            ]);

            foreach ($validated['choices'] as $choiceData) {
                $question->choices()->create($choiceData);
            }

            return $question->load('choices');
        });

        return response()->json(['data' => $question], 201);
    }

    /**
     * @OA\Get(
     *     path="/admin/questions/{id}",
     *     tags={"Admin — Questions"},
     *     summary="Get a question by ID (includes soft-deleted)",
     *     operationId="adminShowQuestion",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Question detail",
     *         @OA\JsonContent(@OA\Property(property="data", type="object"))
     *     ),
     *     @OA\Response(response=404, description="Not found")
     * )
     */
    public function show(int $id): JsonResponse
    {
        $question = Question::withTrashed()->with('choices')->findOrFail($id);

        return response()->json(['data' => $question]);
    }

    /**
     * @OA\Put(
     *     path="/admin/questions/{id}",
     *     tags={"Admin — Questions"},
     *     summary="Update a question (all fields optional; choices replace entirely if provided)",
     *     operationId="adminUpdateQuestion",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\RequestBody(
     *         @OA\JsonContent(
     *             @OA\Property(property="text", type="string"),
     *             @OA\Property(property="category", type="string"),
     *             @OA\Property(property="explanation", type="string"),
     *             @OA\Property(property="choices", type="array", @OA\Items(type="object"))
     *         )
     *     ),
     *     @OA\Response(response=200, description="Updated question",
     *         @OA\JsonContent(@OA\Property(property="data", type="object"))
     *     ),
     *     @OA\Response(response=404, description="Not found")
     * )
     */
    public function update(UpdateQuestionRequest $request, int $id): JsonResponse
    {
        $validated = $request->validated();

        $question = Question::findOrFail($id);

        $question = DB::transaction(function () use ($question, $validated): Question {
            $updateData = array_filter([
                'text'        => $validated['text'] ?? null,
                'explanation' => $validated['explanation'] ?? null,
            ], fn ($v) => $v !== null);

            // question_type can legitimately be null (IT questions), so handle it
            // separately from the non-null filter above.
            if (array_key_exists('question_type', $validated)) {
                $updateData['question_type'] = $validated['question_type'];
            }

            if (isset($validated['category_id'])) {
                $category = Category::findOrFail($validated['category_id']);
                $updateData['category']    = $category->name;
                $updateData['category_id'] = $category->id;
            }

            $question->update($updateData);

            if (isset($validated['choices'])) {
                // Replace all choices atomically.
                $question->choices()->delete();
                foreach ($validated['choices'] as $choiceData) {
                    $question->choices()->create($choiceData);
                }
            }

            return $question->load('choices');
        });

        return response()->json(['data' => $question]);
    }

    /**
     * @OA\Delete(
     *     path="/admin/questions/{id}",
     *     tags={"Admin — Questions"},
     *     summary="Soft-delete a question (preserves answer_records integrity)",
     *     operationId="adminDestroyQuestion",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Archived",
     *         @OA\JsonContent(@OA\Property(property="data", type="object",
     *             @OA\Property(property="message", type="string")
     *         ))
     *     ),
     *     @OA\Response(response=404, description="Not found")
     * )
     */
    public function destroy(int $id): JsonResponse
    {
        $question = Question::findOrFail($id);
        $question->delete(); // SoftDeletes trait — sets deleted_at

        return response()->json(['data' => ['message' => "Question #{$id} archived successfully."]]);
    }

    /**
     * @OA\Post(
     *     path="/admin/questions/import",
     *     tags={"Admin — Questions"},
     *     summary="Bulk import questions from a CSV or JSON file",
     *     operationId="adminImportQuestions",
     *     security={{"bearerAuth":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\MediaType(
     *             mediaType="multipart/form-data",
     *             @OA\Schema(@OA\Property(property="file", type="string", format="binary", description="CSV or JSON file, max 5 MB"))
     *         )
     *     ),
     *     @OA\Response(response=200, description="Import summary",
     *         @OA\JsonContent(@OA\Property(property="data", type="object"))
     *     ),
     *     @OA\Response(response=422, description="Invalid file")
     * )
     *
     * Bulk import questions from a CSV or JSON file.
     *
     * NOTE: Full CSV/JSON parsing is a heavier feature. This stub validates the
     * uploaded file type and returns a placeholder. To implement:
     *   1. Parse the file (League\Csv or json_decode)
     *   2. Validate each row against the same rules as store()
     *   3. Wrap inserts in a DB::transaction() with rollback on any validation failure
     *   4. Return a summary: { imported: N, skipped: M, errors: [...] }
     */
    public function import(Request $request): JsonResponse
    {
        $request->validate([
            'file' => ['required', 'file', 'mimes:xlsx,xls', 'max:10240'],
        ]);

        $path      = $request->file('file')->getRealPath();
        $rows      = $this->parseExcel($path);
        $imported  = 0;
        $skippedDuplicates = 0;
        $errors    = [];

        foreach ($rows as $index => $row) {
            // Row numbers shown to the user are 1-based and skip the header, so +2.
            $lineNum     = $index + 2;
            $categoryStr = $row['category'];

            // Required field check.
            $missingFields = [];
            if (empty($row['text']))        $missingFields[] = 'text';
            if (empty($categoryStr))        $missingFields[] = 'category';
            if (empty($row['explanation'])) $missingFields[] = 'explanation';

            if (!empty($missingFields)) {
                $errors[] = "Row {$lineNum}: missing " . implode(', ', $missingFields);
                continue;
            }

            // Resolve category FK — the category string must match a record in the categories table.
            $category = Category::where('name', $categoryStr)->first();
            if (!$category) {
                $errors[] = "Row {$lineNum}: category \"{$categoryStr}\" not found — use one of the values from the Category Values reference.";
                continue;
            }

            $choices      = $row['choices'];
            $correctCount = count(array_filter($choices, fn ($c) => $c['is_correct']));

            if (count($choices) < 2) {
                $errors[] = "Row {$lineNum}: at least 2 choices required.";
                continue;
            }
            if ($correctCount !== 1) {
                $errors[] = "Row {$lineNum}: exactly one choice must be marked correct (correct_index must be 1–4).";
                continue;
            }

            // Duplicate check: same text + category (including soft-deleted) is considered the same question.
            $exists = Question::withTrashed()
                ->where('category', $categoryStr)
                ->where('text', $row['text'])
                ->exists();

            if ($exists) {
                $skippedDuplicates++;
                continue;
            }

            try {
                DB::transaction(function () use ($row, $category): void {
                    /** @var Question $question */
                    $question = Question::create([
                        'text'          => $row['text'],
                        'category'      => $category->name,
                        'category_id'   => $category->id,
                        'question_type' => $row['question_type'] ?: null,
                        'explanation'   => $row['explanation'],
                    ]);

                    foreach ($row['choices'] as $order => $choice) {
                        $question->choices()->create([
                            'text'       => $choice['text'],
                            'is_correct' => $choice['is_correct'],
                            'order'      => $order,
                        ]);
                    }
                });

                $imported++;
            } catch (\Throwable $e) {
                $errors[] = "Row {$lineNum}: " . $e->getMessage();
            }
        }

        return response()->json([
            'data' => [
                'imported'   => $imported,
                'duplicates' => $skippedDuplicates,
                'skipped'    => count($errors),
                'errors'     => $errors,
            ],
        ]);
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    /**
     * Read an .xlsx / .xls file and return normalised row data.
     *
     * Expected columns (row 1 = header, data starts at row 2):
     *   text | category | question_type | explanation
     *   choice1 | choice2 | choice3 | choice4 | correct_index
     *
     * correct_index is 1-based (1 = choice1 … 4 = choice4).
     * question_type is optional — leave the cell blank for IT questions.
     *
     * @return list<array<string,mixed>>
     */
    private function parseExcel(string $path): array
    {
        $spreadsheet = IOFactory::load($path);
        $sheet       = $spreadsheet->getActiveSheet();
        $data        = $sheet->toArray(nullValue: '', calculateFormulas: true, formatData: false, returnCellRef: false);

        if (empty($data)) {
            return [];
        }

        // Build a header→column-index map from the first row (case-insensitive, trimmed).
        $rawHeader = array_shift($data);
        $header    = array_map(fn ($h) => strtolower(trim((string) $h)), $rawHeader);
        $col       = array_flip($header); // ['text' => 0, 'category' => 1, …]

        $rows = [];
        foreach ($data as $r) {
            // Skip fully empty rows (all cells blank).
            if (count(array_filter(array_map('strval', $r))) === 0) {
                continue;
            }

            $get = fn (string $key): string => trim((string) ($r[$col[$key] ?? -1] ?? ''));

            $correctIdx = (int) $get('correct_index');
            $choices    = [];
            foreach (['choice1', 'choice2', 'choice3', 'choice4'] as $i => $key) {
                $text = $get($key);
                if ($text === '') {
                    continue;
                }
                $choices[] = [
                    'text'       => $text,
                    'is_correct' => ($i + 1) === $correctIdx,
                ];
            }

            $rows[] = [
                'text'          => $get('text'),
                'category'      => $get('category'),
                'question_type' => $get('question_type'),
                'explanation'   => $get('explanation'),
                'choices'       => $choices,
            ];
        }

        return $rows;
    }
}
