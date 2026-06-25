<?php

namespace App\Services;

use App\Models\Choice;
use App\Models\CustomAnswerRecord;
use App\Models\CustomExamResult;
use App\Models\CustomExamSession;
use App\Models\CustomQuestionSet;
use App\Models\Question;
use App\Models\User;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class CustomSetService
{
    private function generateSlug(): string
    {
        do {
            $slug = strtoupper(substr(bin2hex(random_bytes(6)), 0, 8));
        } while (CustomQuestionSet::where('slug', $slug)->exists());

        return $slug;
    }

    public function list(): Collection
    {
        return CustomQuestionSet::withCount('questions')
            ->orderByDesc('created_at')
            ->get()
            ->map(fn (CustomQuestionSet $s) => [
                'id'                  => $s->id,
                'name'                => $s->name,
                'description'         => $s->description,
                'slug'                => $s->slug,
                'time_limit_seconds'  => $s->time_limit_seconds,
                'passing_score'       => $s->passing_score,
                'is_active'           => $s->is_active,
                'question_count'      => $s->questions_count,
                'created_at'          => $s->created_at,
            ]);
    }

    public function create(User $user, array $data): CustomQuestionSet
    {
        return CustomQuestionSet::create([
            'name'                => $data['name'],
            'description'         => $data['description'] ?? null,
            'slug'                => $data['slug'] ?? $this->generateSlug(),
            'created_by'          => $user->id,
            'time_limit_seconds'  => $data['time_limit_seconds'] ?? 0,
            'passing_score'       => $data['passing_score'] ?? 70,
            'is_active'           => $data['is_active'] ?? true,
        ]);
    }

    public function findById(int $id): CustomQuestionSet
    {
        return CustomQuestionSet::with(['questions' => function ($q) {
            $q->with('choices')->orderByPivot('sort_order');
        }])->findOrFail($id);
    }

    public function findBySlug(string $slug): CustomQuestionSet
    {
        return CustomQuestionSet::with(['questions' => function ($q) {
            $q->with('choices')->orderByPivot('sort_order');
        }])->where('slug', $slug)->where('is_active', true)->firstOrFail();
    }

    public function update(CustomQuestionSet $set, array $data): CustomQuestionSet
    {
        $set->update(array_filter([
            'name'                => $data['name']                ?? $set->name,
            'description'         => array_key_exists('description', $data) ? $data['description'] : $set->description,
            'time_limit_seconds'  => $data['time_limit_seconds']  ?? $set->time_limit_seconds,
            'passing_score'       => $data['passing_score']       ?? $set->passing_score,
            'is_active'           => $data['is_active']           ?? $set->is_active,
        ], fn ($v) => $v !== null));

        return $set->fresh();
    }

    public function delete(CustomQuestionSet $set): void
    {
        // Soft-delete questions that were created exclusively for this set
        $customIds = DB::table('custom_set_questions')
            ->join('questions', 'questions.id', '=', 'custom_set_questions.question_id')
            ->where('custom_set_questions.set_id', $set->id)
            ->where('questions.category', 'Custom')
            ->pluck('custom_set_questions.question_id');

        foreach ($customIds as $qid) {
            $inOtherSets = DB::table('custom_set_questions')
                ->where('question_id', $qid)
                ->where('set_id', '!=', $set->id)
                ->exists();

            if (! $inOtherSets) {
                Question::find($qid)?->delete();
            }
        }

        $set->delete();
    }

    public function addQuestion(CustomQuestionSet $set, int $questionId): void
    {
        if (! $set->questions()->where('question_id', $questionId)->exists()) {
            $maxOrder = DB::table('custom_set_questions')
                ->where('set_id', $set->id)
                ->max('sort_order') ?? -1;

            $set->questions()->attach($questionId, ['sort_order' => $maxOrder + 1]);
        }
    }

    public function removeQuestion(CustomQuestionSet $set, int $questionId): void
    {
        $set->questions()->detach($questionId);

        // Soft-delete if this was a Custom-category question not used elsewhere
        $question = Question::find($questionId);
        if ($question && $question->category === 'Custom') {
            $inOtherSets = DB::table('custom_set_questions')
                ->where('question_id', $questionId)
                ->exists();

            if (! $inOtherSets) {
                $question->delete();
            }
        }
    }

    public function createAndAddQuestion(CustomQuestionSet $set, array $data): Question
    {
        return DB::transaction(function () use ($set, $data): Question {
            $question = Question::create([
                'text'        => $data['text'],
                'category'    => 'Custom',
                'explanation' => $data['explanation'] ?? null,
            ]);

            foreach ($data['choices'] as $i => $choice) {
                $question->choices()->create([
                    'text'       => $choice['text'],
                    'is_correct' => (bool) $choice['is_correct'],
                    'order'      => $i,
                ]);
            }

            $maxOrder = DB::table('custom_set_questions')
                ->where('set_id', $set->id)
                ->max('sort_order') ?? -1;

            $set->questions()->attach($question->id, ['sort_order' => $maxOrder + 1]);

            return $question->load('choices');
        });
    }

    public function reorder(CustomQuestionSet $set, array $questionIds): void
    {
        foreach ($questionIds as $order => $questionId) {
            DB::table('custom_set_questions')
                ->where('set_id', $set->id)
                ->where('question_id', $questionId)
                ->update(['sort_order' => $order]);
        }
    }

    public function startSession(CustomQuestionSet $set, User $user): CustomExamSession
    {
        return CustomExamSession::create([
            'set_id'       => $set->id,
            'user_id'      => $user->id,
            'is_submitted' => false,
        ]);
    }

    public function submitSession(CustomExamSession $session, array $answers, string $submittedBy = 'manual', array $violationLog = []): CustomExamResult
    {
        return DB::transaction(function () use ($session, $answers, $submittedBy, $violationLog): CustomExamResult {
            $set = $session->set;

            $questionIds      = array_column($answers, 'question_id');
            $correctChoiceMap = Choice::whereIn('question_id', $questionIds)
                ->where('is_correct', true)
                ->pluck('id', 'question_id');

            $score      = 0;
            $total      = count($answers);
            $answerRows = [];

            foreach ($answers as $answer) {
                $questionId       = (int) $answer['question_id'];
                $selectedChoiceId = isset($answer['choice_id']) ? (int) $answer['choice_id'] : null;
                $isCorrect        = $selectedChoiceId !== null
                    && (int) ($correctChoiceMap[$questionId] ?? -1) === $selectedChoiceId;

                if ($isCorrect) {
                    $score++;
                }

                $answerRows[] = [
                    'question_id'        => $questionId,
                    'selected_choice_id' => $selectedChoiceId,
                    'is_correct'         => $isCorrect,
                ];
            }

            $percentage = $total > 0 ? (int) round(($score / $total) * 100) : 0;
            $status     = $percentage >= $set->passing_score ? 'pass' : 'fail';

            $result = CustomExamResult::create([
                'session_id'      => $session->id,
                'set_id'          => $set->id,
                'user_id'         => $session->user_id,
                'score'           => $score,
                'total_questions' => $total,
                'passing_score'   => $set->passing_score,
                'status'          => $status,
                'completed_at'    => Carbon::now(),
            ]);

            foreach ($answerRows as &$row) {
                $row['result_id'] = $result->id;
            }

            CustomAnswerRecord::insert($answerRows);

            $session->update([
                'is_submitted'  => true,
                'completed_at'  => Carbon::now(),
                'submitted_by'  => $submittedBy,
                'violation_log' => empty($violationLog) ? null : $violationLog,
            ]);

            return $result;
        });
    }

    public function getResults(CustomQuestionSet $set): Collection
    {
        return $set->results()->with('user')->orderByDesc('completed_at')->get();
    }
}
