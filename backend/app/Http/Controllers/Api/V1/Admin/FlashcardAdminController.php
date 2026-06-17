<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreFlashcardRequest;
use App\Http\Requests\Admin\UpdateFlashcardRequest;
use App\Models\Flashcard;
use App\Services\FlashcardService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FlashcardAdminController extends Controller
{
    public function __construct(private FlashcardService $service) {}

    public function index(Request $request): JsonResponse
    {
        $paginator = $this->service->list(
            $request->query('type'),
            $request->query('level'),
        );
        return response()->json([
            'data'     => $paginator->items(),
            'count'    => $paginator->total(),
            'next'     => $paginator->nextPageUrl(),
            'previous' => $paginator->previousPageUrl(),
        ]);
    }

    public function store(StoreFlashcardRequest $request): JsonResponse
    {
        $flashcard = $this->service->create($request->validated());
        return response()->json(['data' => $flashcard], 201);
    }

    public function update(UpdateFlashcardRequest $request, int $id): JsonResponse
    {
        $flashcard = Flashcard::findOrFail($id);
        $updated   = $this->service->update($flashcard, $request->validated());
        return response()->json(['data' => $updated]);
    }

    public function destroy(int $id): JsonResponse
    {
        $flashcard = Flashcard::findOrFail($id);
        $this->service->delete($flashcard);
        return response()->json(null, 204);
    }
}
