<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePassageRequest;
use App\Http\Requests\UpdatePassageRequest;
use App\Models\Passage;
use App\Services\PassageService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PassageController extends Controller
{
    public function __construct(private PassageService $service) {}

    public function index(Request $request): JsonResponse
    {
        $passages = $this->service->list($request->query('level'));
        return response()->json([
            'data'  => $passages->items(),
            'count' => $passages->total(),
            'next'  => $passages->nextPageUrl(),
            'previous' => $passages->previousPageUrl(),
        ]);
    }

    public function store(StorePassageRequest $request): JsonResponse
    {
        $passage = $this->service->create($request->validated());
        return response()->json(['data' => $passage], 201);
    }

    public function show(int $id): JsonResponse
    {
        $passage = Passage::with('questions')->findOrFail($id);
        return response()->json(['data' => $passage]);
    }

    public function update(UpdatePassageRequest $request, int $id): JsonResponse
    {
        $passage = Passage::findOrFail($id);
        $updated = $this->service->update($passage, $request->validated());
        return response()->json(['data' => $updated]);
    }

    public function destroy(int $id): JsonResponse
    {
        $passage = Passage::findOrFail($id);
        $this->service->delete($passage);
        return response()->json(null, 204);
    }
}
