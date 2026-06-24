<?php

namespace App\Services;

use App\Models\AnswerRecord;
use App\Models\Choice;
use App\Models\ExamResult;
use App\Models\ExamSession;
use App\Models\Question;
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

            // 1. Pre-load all correct choice IDs and question/choice text for snapshot.
            $questionIds      = array_column($answers, 'question_id');
            $correctChoiceMap = Choice::whereIn('question_id', $questionIds)
                ->where('is_correct', true)
                ->pluck('id', 'question_id'); // [question_id => correct_choice_id]

            // Snapshot: question text keyed by question_id
            $questionTextMap = Question::whereIn('id', $questionIds)
                ->pluck('text', 'id');

            // Snapshot: all choice texts keyed by choice_id
            $allChoiceIds = array_filter(array_column($answers, 'choice_id'));
            $correctChoiceIds = $correctChoiceMap->values()->all();
            $allRelevantChoiceIds = array_unique(array_merge($allChoiceIds, $correctChoiceIds));
            $choiceTextMap = Choice::whereIn('id', $allRelevantChoiceIds)
                ->pluck('text', 'id');

            // 2. Score the answers.
            $score = 0;
            $total = count($answers);

            $answerRows = [];
            foreach ($answers as $answer) {
                $questionId       = (int) $answer['question_id'];
                $selectedChoiceId = isset($answer['choice_id']) ? (int) $answer['choice_id'] : null;
                $timeTaken        = isset($answer['time_taken_seconds']) ? (int) $answer['time_taken_seconds'] : null;

                // Pre-compute correctness at submission time (never recalculate on read).
                $correctChoiceId = isset($correctChoiceMap[$questionId]) ? (int) $correctChoiceMap[$questionId] : null;
                $isCorrect = $selectedChoiceId !== null
                    && $correctChoiceId === $selectedChoiceId;

                if ($isCorrect) {
                    $score++;
                }

                $answerRows[] = [
                    'question_id'                   => $questionId,
                    'selected_choice_id'            => $selectedChoiceId,
                    'is_correct'                    => $isCorrect,
                    'time_taken_seconds'            => $timeTaken,
                    'question_text_snapshot'        => $questionTextMap[$questionId] ?? null,
                    'selected_choice_text_snapshot' => $selectedChoiceId ? ($choiceTextMap[$selectedChoiceId] ?? null) : null,
                    'correct_choice_text_snapshot'  => $correctChoiceId ? ($choiceTextMap[$correctChoiceId] ?? null) : null,
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
