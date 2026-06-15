<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Question;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class QuestionController extends Controller
{
    /**
     * @OA\Get(
     *     path="/exams/questions",
     *     tags={"Exams"},
     *     summary="List questions (paginated, filterable)",
     *     operationId="listQuestions",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="category", in="query", required=false, @OA\Schema(type="string"), description="Filter by category, e.g. AWS SAA"),
     *     @OA\Parameter(name="difficulty", in="query", required=false, @OA\Schema(type="string", enum={"easy","medium","hard"})),
     *     @OA\Parameter(name="page", in="query", required=false, @OA\Schema(type="integer")),
     *     @OA\Response(
     *         response=200,
     *         description="Paginated questions with choices",
     *         @OA\JsonContent(
     *             @OA\Property(property="data", type="array", @OA\Items(type="object",
     *                 @OA\Property(property="id", type="integer"),
     *                 @OA\Property(property="text", type="string"),
     *                 @OA\Property(property="category", type="string"),
     *                 @OA\Property(property="difficulty", type="string"),
     *                 @OA\Property(property="choices", type="array", @OA\Items(type="object"))
     *             )),
     *             @OA\Property(property="count", type="integer"),
     *             @OA\Property(property="next", type="string", nullable=true),
     *             @OA\Property(property="previous", type="string", nullable=true)
     *         )
     *     ),
     *     @OA\Response(response=401, description="Unauthenticated")
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

        $perPage = min((int) $request->input('per_page', 20), 500);
        $paginator = $query->paginate(perPage: $perPage);

        return response()->json([
            'data'     => $paginator->items(),
            'count'    => $paginator->total(),
            'next'     => $paginator->nextPageUrl(),
            'previous' => $paginator->previousPageUrl(),
        ]);
    }
}
