<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreCategoryRequest;
use App\Models\Category;
use Illuminate\Http\JsonResponse;

class CategoryController extends Controller
{
    public function index(): JsonResponse
    {
        $categories = Category::withCount('questions')->orderBy('name')->get();
        return response()->json(['data' => $categories]);
    }

    public function publicIndex(): JsonResponse
    {
        $categories = Category::withCount('questions')
            ->where('name', 'not like', 'JLPT%')
            ->orderBy('name')
            ->get();
        return response()->json(['data' => $categories]);
    }

    public function store(StoreCategoryRequest $request): JsonResponse
    {
        $category = Category::create($request->validated());
        return response()->json(['data' => $category], 201);
    }

    public function update(StoreCategoryRequest $request, int $id): JsonResponse
    {
        $category = Category::findOrFail($id);
        $category->update($request->validated());
        return response()->json(['data' => $category]);
    }

    public function destroy(int $id): JsonResponse
    {
        $category = Category::findOrFail($id);

        if ($category->questions()->exists()) {
            return response()->json(['error' => 'Cannot delete a category that has questions assigned to it.'], 422);
        }

        $category->delete();
        return response()->json(['data' => ['message' => "Category #{$id} deleted."]]);
    }
}
