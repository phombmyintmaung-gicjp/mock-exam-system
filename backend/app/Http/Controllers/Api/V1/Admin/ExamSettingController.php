<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateExamSettingRequest;
use App\Models\ExamSetting;
use App\Models\Question;
use Illuminate\Http\JsonResponse;

class ExamSettingController extends Controller
{
    /**
     * Return settings for every category that has at least one question.
     * Categories without a row in exam_settings return config/hard-coded defaults.
     */
    public function index(): JsonResponse
    {
        $categories = Question::distinct()->pluck('category')->sort()->values();

        $saved = ExamSetting::whereIn('category', $categories)
            ->get()
            ->keyBy('category');

        $data = $categories->map(function (string $cat) use ($saved) {
            /** @var ExamSetting|null $s */
            $s = $saved->get($cat);

            return [
                'category'           => $cat,
                'time_limit_seconds' => $s?->time_limit_seconds ?? config('exam.default_time_limit', 3600),
                'passing_score'      => $s?->passing_score      ?? config('exam.passing_score', 70),
                'question_count'     => $s?->question_count     ?? config('exam.default_question_count', 20),
            ];
        });

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
