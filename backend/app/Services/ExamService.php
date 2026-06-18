<?php

namespace App\Services;

use App\Models\ExamSession;
use App\Models\Question;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;

class ExamService
{
    public function createSession(User $user, array $data): ExamSession
    {
        return ExamSession::create([
            'user_id'              => $user->id,
            'category'             => $data['category'],
            'mode'                 => $data['mode'],
            'time_limit_seconds'   => $data['time_limit_seconds'] ?? config('exam.default_time_limit', 3600),
            'question_type_filter' => !empty($data['question_types']) ? $data['question_types'] : null,
            'is_submitted'         => false,
        ]);
    }

    public function getSessionQuestions(ExamSession $session, int $count = 20, array $questionTypes = []): Collection
    {
        if (str_starts_with($session->category, 'JLPT-')) {
            if (str_ends_with($session->category, '-Full')) {
                return $this->getJLPTFullExamQuestions($session);
            }
            return $this->getJLPTQuestions($session, $count, $questionTypes);
        }
        return $this->getBalancedQuestions($session, $count);
    }

    private function getJLPTFullExamQuestions(ExamSession $session): Collection
    {
        preg_match('/JLPT-(N\d)-Full/', $session->category, $m);
        $level = $m[1] ?? 'N5';

        // Vocab/Kanji section — 問題1→5, no passages
        $vocabQuestions = Question::with(['choices'])
            ->where('category', "JLPT-{$level}-文字語彙")
            ->orderByRaw("CASE question_type
                WHEN '問題1' THEN 1
                WHEN '問題2' THEN 2
                WHEN '問題3' THEN 3
                WHEN '問題4' THEN 4
                WHEN '問題5' THEN 5
                ELSE 99 END")
            ->get();

        // Grammar/Reading section — 問題1→６, load passages
        $grammarQuestions = Question::with(['choices', 'passage'])
            ->where('category', "JLPT-{$level}-文法読解")
            ->orderByRaw("CASE question_type
                WHEN '問題1' THEN 1
                WHEN '問題2' THEN 2
                WHEN '問題3' THEN 3
                WHEN '問題4' THEN 4
                WHEN '問題5' THEN 5
                WHEN '問題6' THEN 6
                ELSE 99 END")
            ->get();

        // Keep passage-linked questions grouped by passage_id
        $noPassage  = $grammarQuestions->filter(fn ($q) => is_null($q->passage_id));
        $hasPassage = $grammarQuestions->filter(fn ($q) => !is_null($q->passage_id));
        $grouped    = $hasPassage->groupBy(fn ($q) => $q->passage_id)->values()->flatten(1);

        return $vocabQuestions->concat($noPassage)->concat($grouped)->values();
    }

    private function getJLPTQuestions(ExamSession $session, int $count, array $questionTypes = []): Collection
    {
        $needsPassage = str_ends_with($session->category, '-文法読解')
                     || str_ends_with($session->category, '-Reading');
        $with = $needsPassage ? ['choices', 'passage'] : ['choices'];

        $query = Question::with($with)
            ->byCategory($session->category);

        if (!empty($questionTypes)) {
            $query->whereIn('question_type', $questionTypes);
        }

        // When a sub-section filter is active (Vocab/Kanji/Grammar/Reading), return
        // all matching questions — the pool is already scoped to the right types and
        // the frontend badge already shows the real count. For full-section practice
        // (no filter), cap at $count and randomise within each type group.
        $queryBuilder = $query->orderByRaw("CASE question_type
                WHEN '問題1'     THEN 1
                WHEN '問題2'     THEN 2
                WHEN '問題3'     THEN 3
                WHEN '問題4'     THEN 4
                WHEN '問題5'     THEN 5
                WHEN '問題6'     THEN 6
                ELSE 99 END, RAND()");

        $questions = empty($questionTypes)
            ? $queryBuilder->limit($count)->get()
            : $queryBuilder->get();

        if ($needsPassage) {
            $noPassage  = $questions->filter(fn ($q) => is_null($q->passage_id));
            $hasPassage = $questions->filter(fn ($q) => !is_null($q->passage_id));
            $grouped    = $hasPassage->groupBy(fn ($q) => $q->passage_id)->values()->flatten(1);
            return $noPassage->concat($grouped)->values();
        }

        return $questions;
    }

    private function getBalancedQuestions(ExamSession $session, int $count): Collection
    {
        $with = ['choices'];

        return Question::with($with)
            ->byCategory($session->category)
            ->inRandomOrder()
            ->limit($count)
            ->get()
            ->shuffle()
            ->values();
    }
}
