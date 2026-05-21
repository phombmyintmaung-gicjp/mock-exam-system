<?php

namespace App\Services;

use App\Models\AnswerRecord;
use App\Models\ExamResult;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class AnalyticsService
{
    /**
     * Return pass/fail counts grouped by exam category.
     * Aggregated on-the-fly from exam_results — no separate analytics table.
     *
     * @return list<array{category: string, pass: int, fail: int, total: int}>
     */
    public function getCategoryStats(): array
    {
        $rows = ExamResult::select([
                'exam_sessions.category',
                DB::raw("SUM(CASE WHEN exam_results.status = 'pass' THEN 1 ELSE 0 END) AS pass_count"),
                DB::raw("SUM(CASE WHEN exam_results.status = 'fail' THEN 1 ELSE 0 END) AS fail_count"),
                DB::raw('COUNT(*) AS total'),
            ])
            ->join('exam_sessions', 'exam_sessions.id', '=', 'exam_results.session_id')
            ->groupBy('exam_sessions.category')
            ->orderBy('exam_sessions.category')
            ->get();

        return $rows->map(fn ($row) => [
            'category' => $row->category,
            'pass'     => (int) $row->pass_count,
            'fail'     => (int) $row->fail_count,
            'total'    => (int) $row->total,
        ])->all();
    }

    /**
     * Return per-category accuracy for a specific user.
     * Accuracy = correct answers / total answers in that category.
     *
     * @return list<array{category: string, correct: int, total: int, accuracy: float}>
     */
    public function getWeakAreas(User $user): array
    {
        $rows = AnswerRecord::select([
                'questions.category',
                DB::raw('SUM(answer_records.is_correct) AS correct_count'),
                DB::raw('COUNT(*) AS total_count'),
            ])
            ->join('questions', 'questions.id', '=', 'answer_records.question_id')
            ->join('exam_results', 'exam_results.id', '=', 'answer_records.result_id')
            ->where('exam_results.user_id', $user->id)
            ->groupBy('questions.category')
            ->orderBy('questions.category')
            ->get();

        return $rows->map(fn ($row) => [
            'category' => $row->category,
            'correct'  => (int) $row->correct_count,
            'total'    => (int) $row->total_count,
            'accuracy' => $row->total_count > 0
                ? round((int) $row->correct_count / (int) $row->total_count * 100, 2)
                : 0.0,
        ])->all();
    }

    /**
     * Return the user's score history ordered by completion time.
     * Score is expressed as a percentage (score / total_questions * 100).
     *
     * @return list<array{completed_at: string, score: int, total: int, percentage: float, status: string}>
     */
    public function getScoreTrend(User $user): array
    {
        $results = ExamResult::where('user_id', $user->id)
            ->orderBy('completed_at')
            ->get(['score', 'total_questions', 'status', 'completed_at']);

        return $results->map(fn ($r) => [
            'completed_at' => $r->completed_at?->toIso8601String(),
            'score'        => $r->score,
            'total'        => $r->total_questions,
            'percentage'   => $r->total_questions > 0
                ? round($r->score / $r->total_questions * 100, 2)
                : 0.0,
            'status'       => $r->status,
        ])->all();
    }
}
