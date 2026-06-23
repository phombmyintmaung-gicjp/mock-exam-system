<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateExamSettingRequest;
use App\Models\ExamSetting;
use Illuminate\Http\JsonResponse;

class ExamSettingController extends Controller
{
    /**
     * Return all rows from exam_settings, sorted by category name.
     */
    public function index(): JsonResponse
    {
        $data = ExamSetting::orderBy('category')->get()->map(fn (ExamSetting $s) => [
            'category'           => $s->category,
            'time_limit_seconds' => $s->time_limit_seconds,
            'passing_score'      => $s->passing_score,
            'question_count'     => $s->question_count,
        ]);

        return response()->json(['data' => $data]);
    }

    /**
     * Upsert settings for a single category.
     */
    public function update(UpdateExamSettingRequest $request, string $category): JsonResponse
    {
        $setting = ExamSetting::updateOrCreate(
            ['category' => $category],
            $request->validated()
        );

        return response()->json(['data' => $setting]);
    }
}
