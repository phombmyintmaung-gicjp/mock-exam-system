<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCustomFlashcardSetRequest;
use App\Models\CustomFlashcardSet;
use App\Services\CustomFlashcardSetService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CustomFlashcardSetController extends Controller
{
    public function __construct(private CustomFlashcardSetService $service) {}

    /**
     * GET /flashcard-sets
     * Lists the authenticated user's saved custom study sets, optionally filtered by type.
     */
    public function index(Request $request): JsonResponse
    {
        /** @var \App\Models\User $user */
        $user = auth()->user();
        $data = $this->service->list($user, $request->query('type'));

        return response()->json([
            'data'  => $data,
            'count' => $data->count(),
        ]);
    }

    /**
     * POST /flashcard-sets
     * Saves a new custom study set (type + multiple levels) for the authenticated user.
     */
    public function store(StoreCustomFlashcardSetRequest $request): JsonResponse
    {
        /** @var \App\Models\User $user */
        $user = auth()->user();
        $set  = $this->service->create($user, $request->validated());

        return response()->json(['data' => $set], 201);
    }

    /**
     * DELETE /flashcard-sets/{id}
     * Deletes a custom study set. 404s if it doesn't belong to the authenticated user.
     */
    public function destroy(int $id): JsonResponse
    {
        /** @var \App\Models\User $user */
        $user = auth()->user();
        $set  = CustomFlashcardSet::where('user_id', $user->id)->find($id);

        if (!$set) {
            abort(404);
        }

        $this->service->delete($set);

        return response()->json(null, 204);
    }
}
