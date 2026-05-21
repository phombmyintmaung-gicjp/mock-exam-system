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
     * Fetch a random set of questions from the session's category with their choices.
     *
     * @param  ExamSession $session
     * @param  int         $count   Number of questions to include (default 20).
     * @return Collection<int, Question>
     */
    public function getSessionQuestions(ExamSession $session, int $count = 20): Collection
    {
        return Question::with('choices')
            ->byCategory($session->category)
            ->inRandomOrder()
            ->limit($count)
            ->get();
    }
}
