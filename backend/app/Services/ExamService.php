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
            'user_id'             => $user->id,
            'category'            => $data['category'],
            'mode'                => $data['mode'],
            'time_limit_seconds'  => $data['time_limit_seconds'] ?? config('exam.default_time_limit', 3600),
            'is_submitted'        => false,
        ]);
    }

    public function getSessionQuestions(ExamSession $session, int $count = 20): Collection
    {
        if (str_starts_with($session->category, 'JLPT-')) {
            return $this->getJLPTQuestions($session, $count);
        }
        return $this->getBalancedQuestions($session, $count);
    }

    private function getJLPTQuestions(ExamSession $session, int $count): Collection
    {
        $needsPassage = str_ends_with($session->category, '-文法読解')
                     || str_ends_with($session->category, '-Reading');
        $with = $needsPassage ? ['choices', 'passage'] : ['choices'];

        $questions = Question::with($with)
            ->byCategory($session->category)
            ->orderByRaw("CASE question_type
                WHEN '問題1'     THEN 1
                WHEN '問題2'     THEN 2
                WHEN '問題3'     THEN 3
                WHEN '問題4'     THEN 4
                WHEN '問題5'     THEN 5
                WHEN 'もんだい１' THEN 1
                WHEN 'もんだい２' THEN 2
                WHEN 'もんだい３' THEN 3
                WHEN 'もんだい４' THEN 4
                WHEN 'もんだい５' THEN 5
                WHEN 'もんだい６' THEN 6
                ELSE 99 END, id ASC")
            ->limit($count)
            ->get();

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
        $isReading = str_ends_with($session->category, '-Reading');
        $with      = $isReading ? ['choices', 'passage'] : ['choices'];

        $difficulties = ['easy', 'medium', 'hard'];
        $base         = intdiv($count, count($difficulties));
        $remainder    = $count % count($difficulties);

        $allocations = [];
        foreach ($difficulties as $i => $diff) {
            $allocations[$diff] = $base + ($i < $remainder ? 1 : 0);
        }

        $selected   = new Collection();
        $shortfalls = [];

        foreach ($allocations as $diff => $needed) {
            $fetched = Question::with($with)
                ->byCategory($session->category)
                ->where('difficulty', $diff)
                ->inRandomOrder()
                ->limit($needed)
                ->get();

            $selected  = $selected->concat($fetched);
            $shortfall = $needed - $fetched->count();
            if ($shortfall > 0) {
                $shortfalls[$diff] = $shortfall;
            }
        }

        if (array_sum($shortfalls) > 0) {
            $excludeIds = $selected->pluck('id')->all();
            $filler = Question::with($with)
                ->byCategory($session->category)
                ->whereNotIn('id', $excludeIds)
                ->inRandomOrder()
                ->limit(array_sum($shortfalls))
                ->get();
            $selected = $selected->concat($filler);
        }

        if ($isReading) {
            return $selected->groupBy(fn ($q) => $q->passage_id ?? 0)->shuffle()->flatten(1)->values();
        }

        return $selected->shuffle()->values();
    }
}
