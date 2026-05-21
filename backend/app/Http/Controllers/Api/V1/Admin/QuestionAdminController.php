<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreQuestionRequest;
use App\Http\Requests\Admin\UpdateQuestionRequest;
use App\Models\Choice;
use App\Models\Question;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

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
     *     @OA\Parameter(name="difficulty", in="query", required=false, @OA\Schema(type="string", enum={"easy","medium","hard"})),
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
        }

        if ($request->filled('difficulty')) {
            $query->where('difficulty', $request->input('difficulty'));
        }

        if ($request->boolean('with_trashed')) {
            $query->withTrashed();
        }

        $paginator = $query->paginate(perPage: 25);

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
     *             required={"text","difficulty","category","explanation","choices"},
     *             @OA\Property(property="text", type="string"),
     *             @OA\Property(property="difficulty", type="string", enum={"easy","medium","hard"}),
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
            /** @var Question $question */
            $question = Question::create([
                'text'        => $validated['text'],
                'difficulty'  => $validated['difficulty'],
                'category'    => $validated['category'],
                'explanation' => $validated['explanation'],
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
     *             @OA\Property(property="difficulty", type="string", enum={"easy","medium","hard"}),
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
            $question->update(array_filter([
                'text'        => $validated['text'] ?? null,
                'difficulty'  => $validated['difficulty'] ?? null,
                'category'    => $validated['category'] ?? null,
                'explanation' => $validated['explanation'] ?? null,
            ], fn ($v) => $v !== null));

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
            'file' => ['required', 'file', 'mimes:csv,json,txt', 'max:5120'],
        ]);

        // Stub — replace with real parsing logic.
        return response()->json([
            'data' => [
                'message' => 'Import stub: integrate CSV/JSON parsing to process the uploaded file.',
                'file'    => $request->file('file')?->getClientOriginalName(),
            ],
        ]);
    }
}
