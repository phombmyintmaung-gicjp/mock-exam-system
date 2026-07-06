<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Flashcard;
use App\Services\FlashcardBookmarkService;
use Illuminate\Http\JsonResponse;

class FlashcardBookmarkController extends Controller
{
    public function __construct(private FlashcardBookmarkService $service) {}

    /**
     * GET /study/flashcards/bookmarked
     * Returns all flashcards the authenticated user has bookmarked.
     */
    public function index(): JsonResponse
    {
        /** @var \App\Models\User $user */
        $user = auth()->user();
        $data = $this->service->list($user);

        return response()->json([
            'data'  => $data,
            'count' => $data->count(),
        ]);
    }

    /**
     * POST /study/flashcards/{id}/bookmark
     * Bookmarks a flashcard for the authenticated user.
     */
    public function store(int $id): JsonResponse
    {
        /** @var \App\Models\User $user */
        $user      = auth()->user();
        $flashcard = Flashcard::findOrFail($id);
        $bookmark  = $this->service->toggleOn($user, $flashcard);

        return response()->json(['data' => $bookmark], 201);
    }

    /**
     * DELETE /study/flashcards/{id}/bookmark
     * Removes a flashcard bookmark for the authenticated user.
     */
    public function destroy(int $id): JsonResponse
    {
        /** @var \App\Models\User $user */
        $user      = auth()->user();
        $flashcard = Flashcard::findOrFail($id);
        $this->service->toggleOff($user, $flashcard);

        return response()->json(null, 204);
    }
}
