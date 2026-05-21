<?php

namespace App\Services;

use App\Models\AnswerRecord;
use App\Models\Choice;
use App\Models\ExamResult;
use App\Models\ExamSession;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class ResultService
{
    /**
     * Calculate the exam result, persist all answer records, and mark the session as submitted.
     *
     * All writes are wrapped in a transaction — if any step fails the session
     * remains un-submitted so the user can retry.
     *
     * @param  ExamSession             $session
     * @param  list<array{
     *     question_id: int,
     *     choice_id: int|null,
     *     time_taken_seconds: int|null
     * }>                              $answers
     * @param  int                     $passingScore  The passing threshold (0-100 as a percentage).
     * @return ExamResult
     */
    public function calculate(ExamSession $session, array $answers, int $passingScore): ExamResult
    {
        return DB::transaction(function () use ($session, $answers, $passingScore): ExamResult {

            // 1. Pre-load all correct choice IDs for the relevant questions to avoid N+1.
            $questionIds      = array_column($answers, 'question_id');
            $correctChoiceMap = Choice::whereIn('question_id', $questionIds)
                ->where('is_correct', true)
                ->pluck('id', 'question_id'); // [question_id => correct_choice_id]

            // 2. Score the answers.
            $score = 0;
            $total = count($answers);

            $answerRows = [];
            foreach ($answers as $answer) {
                $questionId       = (int) $answer['question_id'];
                $selectedChoiceId = isset($answer['choice_id']) ? (int) $answer['choice_id'] : null;
                $timeTaken        = isset($answer['time_taken_seconds']) ? (int) $answer['time_taken_seconds'] : null;

                // Pre-compute correctness at submission time (never recalculate on read).
                $isCorrect = $selectedChoiceId !== null
                    && (int) ($correctChoiceMap[$questionId] ?? -1) === $selectedChoiceId;

                if ($isCorrect) {
                    $score++;
                }

                $answerRows[] = [
                    'question_id'        => $questionId,
                    'selected_choice_id' => $selectedChoiceId,
                    'is_correct'         => $isCorrect,
                    'time_taken_seconds' => $timeTaken,
                ];
            }

            // 3. Determine pass/fail based on percentage vs passing score threshold.
            $percentage = $total > 0 ? (int) round(($score / $total) * 100) : 0;
            $status     = $percentage >= $passingScore ? 'pass' : 'fail';
            $now        = Carbon::now();

            // 4. Create the ExamResult — user_id is denormalized for analytics performance.
            /** @var ExamResult $result */
            $result = ExamResult::create([
                'session_id'      => $session->id,
                'user_id'         => $session->user_id,
                'score'           => $score,
                'total_questions' => $total,
                'passing_score'   => $passingScore,
                'status'          => $status,
                'completed_at'    => $now,
            ]);

            // 5. Bulk-insert answer records with the result FK.
            foreach ($answerRows as &$row) {
                $row['result_id'] = $result->id;
            }
            unset($row);

            AnswerRecord::insert($answerRows);

            // 6. Mark the session as submitted so it cannot be re-submitted.
            $session->update([
                'is_submitted' => true,
                'completed_at' => $now,
            ]);

            return $result;
        });
    }
}
