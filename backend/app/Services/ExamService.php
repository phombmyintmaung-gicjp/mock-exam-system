<?php

namespace App\Services;

use App\Models\ExamSession;
use App\Models\Question;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;

class ExamService
{
    /**
     * Create a new exam session for the given user.
     *
     * @param  User                   $user
     * @param  array<string, mixed>   $data  Validated data from StartSessionRequest.
     *                                       Keys: category, mode, time_limit_seconds?, question_count?
     * @return ExamSession
     */
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

    /**
     * Fetch a balanced set of questions from the session's category.
     *
     * Questions are distributed evenly across easy / medium / hard difficulty.
     * If a difficulty tier has fewer questions than its allocated share, the
     * shortfall is filled from the remaining pool so the total always equals
     * $count (or the total available if there are not enough questions).
     *
     * @param  ExamSession $session
     * @param  int         $count   Target number of questions (default 20).
     * @return Collection<int, Question>
     */
    public function getSessionQuestions(ExamSession $session, int $count = 20): Collection
    {
        $difficulties = ['easy', 'medium', 'hard'];
        $tiers        = count($difficulties);

        $base      = intdiv($count, $tiers);
        $remainder = $count % $tiers;

        // Distribute the remainder to the first N tiers.
        $allocations = [];
        foreach ($difficulties as $i => $diff) {
            $allocations[$diff] = $base + ($i < $remainder ? 1 : 0);
        }

        $selected   = new Collection();
        $shortfalls = [];

        // First pass: fetch what each tier can supply.
        foreach ($allocations as $diff => $needed) {
            $fetched = Question::with('choices')
                ->byCategory($session->category)
                ->where('difficulty', $diff)
                ->inRandomOrder()
                ->limit($needed)
                ->get();

            $selected   = $selected->concat($fetched);
            $shortfall  = $needed - $fetched->count();
            if ($shortfall > 0) {
                $shortfalls[$diff] = $shortfall;
            }
        }

        // Second pass: fill shortfalls from the unrestricted pool.
        $totalShortfall = array_sum($shortfalls);
        if ($totalShortfall > 0) {
            $excludeIds = $selected->pluck('id')->all();
            $filler = Question::with('choices')
                ->byCategory($session->category)
                ->whereNotIn('id', $excludeIds)
                ->inRandomOrder()
                ->limit($totalShortfall)
                ->get();

            $selected = $selected->concat($filler);
        }

        // Shuffle so tiers are not grouped.
        return $selected->shuffle()->values();
    }
}
