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
     * Return per-category attempt count, best score %, and most recent score % for a user.
     *
     * @return list<array{category: string, attempt_count: int, best_score: float, latest_score: float}>
     */
    public function getRetryStats(User $user): array
    {
        $rows = ExamResult::select([
                'exam_sessions.category',
                DB::raw('COUNT(*) AS attempt_count'),
                DB::raw('MAX(ROUND(exam_results.score / NULLIF(exam_results.total_questions, 0) * 100, 2)) AS best_score'),
            ])
            ->join('exam_sessions', 'exam_sessions.id', '=', 'exam_results.session_id')
            ->where('exam_results.user_id', $user->id)
            ->groupBy('exam_sessions.category')
            ->orderBy('exam_sessions.category')
            ->get();

        // Latest score per category — fetch ordered by date desc, PHP groupBy picks first per category
        $latestByCategory = ExamResult::select([
                'exam_sessions.category',
                'exam_results.score',
                'exam_results.total_questions',
            ])
            ->join('exam_sessions', 'exam_sessions.id', '=', 'exam_results.session_id')
            ->where('exam_results.user_id', $user->id)
            ->orderBy('exam_results.completed_at', 'desc')
            ->get()
            ->groupBy('category')
            ->map(fn ($group) => $group->first())
            ->map(fn ($row) => $row->total_questions > 0
                ? round((float) $row->score / (float) $row->total_questions * 100, 2)
                : 0.0
            );

        return $rows->map(fn ($row) => [
            'category'      => $row->category,
            'attempt_count' => (int) $row->attempt_count,
            'best_score'    => (float) $row->best_score,
            'latest_score'  => (float) ($latestByCategory[$row->category] ?? 0.0),
        ])->all();
    }

    /**
     * Return questions whose correct-answer rate (across all users) falls below $threshold.
     * Only questions with at least $minAttempts recorded answers are included.
     *
     * @return list<array{questionId: int, questionText: string, category: string, questionType: string|null, attemptCount: int, correctRate: float}>
     */
    public function getDifficultQuestions(float $threshold = 0.30, int $minAttempts = 5): array
    {
        return DB::table('answer_records')
            ->join('questions', 'questions.id', '=', 'answer_records.question_id')
            ->whereNull('questions.deleted_at')
            ->select([
                'questions.id as question_id',
                'questions.text as question_text',
                'questions.category',
                'questions.question_type',
                DB::raw('COUNT(*) as attempt_count'),
                DB::raw('ROUND(SUM(answer_records.is_correct) / COUNT(*) * 100, 1) as correct_rate'),
            ])
            ->groupBy('questions.id', 'questions.text', 'questions.category', 'questions.question_type')
            ->havingRaw('COUNT(*) >= ?', [$minAttempts])
            ->havingRaw('SUM(answer_records.is_correct) / COUNT(*) < ?', [$threshold])
            ->orderBy('correct_rate', 'asc')
            ->get()
            ->map(fn ($row) => [
                'questionId'   => (int) $row->question_id,
                'questionText' => $row->question_text,
                'category'     => $row->category,
                'questionType' => $row->question_type,
                'attemptCount' => (int) $row->attempt_count,
                'correctRate'  => (float) $row->correct_rate,
            ])
            ->all();
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
