<?php

namespace App\Services;

use App\Models\Flashcard;
use App\Models\FlashcardReview;
use App\Models\User;
use Illuminate\Support\Carbon;

class FlashcardReviewService
{
    /**
     * SM-2 quality ratings used by the frontend:
     *   0 = Again  (complete blackout — restart interval)
     *   1 = Hard   (correct with significant difficulty)
     *   2 = Good   (correct with some effort)
     *   3 = Easy   (perfect recall)
     *
     * These map to SM-2's 0–5 scale: 0→0, 1→2, 2→4, 3→5.
     */
    private const QUALITY_MAP = [0 => 0, 1 => 2, 2 => 4, 3 => 5];

    public function review(User $user, Flashcard $flashcard, int $rating): FlashcardReview
    {
        $review = FlashcardReview::firstOrNew([
            'user_id'      => $user->id,
            'flashcard_id' => $flashcard->id,
        ]);

        if (!$review->exists) {
            $review->interval_days = 1;
            $review->ease_factor   = 2.5;
            $review->repetitions   = 0;
        }

        $q = self::QUALITY_MAP[$rating] ?? 4;

        // SM-2 algorithm
        if ($q < 3) {
            // Fail — reset to beginning
            $review->repetitions  = 0;
            $review->interval_days = 1;
        } else {
            // Pass — advance
            if ($review->repetitions === 0) {
                $review->interval_days = 1;
            } elseif ($review->repetitions === 1) {
                $review->interval_days = 6;
            } else {
                $review->interval_days = (int) round($review->interval_days * $review->ease_factor);
            }
            $review->repetitions++;
        }

        // Update ease factor (never goes below 1.3)
        $ef = $review->ease_factor + (0.1 - (3 - $q) * (0.08 + (3 - $q) * 0.02));
        $review->ease_factor = max(1.3, round($ef, 4));

        $review->next_review_at   = Carbon::now()->addDays($review->interval_days);
        $review->last_reviewed_at = Carbon::now();

        $review->save();

        return $review;
    }

    /**
     * Return flashcards due for review by the user (next_review_at <= now).
     * Also includes new cards (no review record yet).
     *
     * @return \Illuminate\Database\Eloquent\Collection<int, Flashcard>
     */
    public function getDueCards(User $user, ?string $type = null, ?string $level = null, int $limit = 50)
    {
        // IDs of cards the user has reviewed and are due now
        $dueIds = FlashcardReview::where('user_id', $user->id)
            ->where('next_review_at', '<=', Carbon::now())
            ->pluck('flashcard_id');

        // IDs the user has seen at all
        $seenIds = FlashcardReview::where('user_id', $user->id)
            ->pluck('flashcard_id');

        $query = Flashcard::query();

        if ($type)  $query->where('type', $type);
        if ($level) $query->where('level', $level);

        return $query->where(function ($q) use ($dueIds, $seenIds) {
            $q->whereIn('id', $dueIds)          // due for review
              ->orWhereNotIn('id', $seenIds);    // never seen — always include new cards
        })->limit($limit)->get();
    }

    /**
     * Return the review state for a set of flashcard IDs for a user.
     *
     * @return array<int, array{interval_days: int, ease_factor: float, repetitions: int, next_review_at: string|null}>
     */
    public function getReviewStates(User $user, array $flashcardIds): array
    {
        return FlashcardReview::where('user_id', $user->id)
            ->whereIn('flashcard_id', $flashcardIds)
            ->get()
            ->keyBy('flashcard_id')
            ->map(fn ($r) => [
                'interval_days'    => $r->interval_days,
                'ease_factor'      => $r->ease_factor,
                'repetitions'      => $r->repetitions,
                'next_review_at'   => $r->next_review_at?->toISOString(),
                'last_reviewed_at' => $r->last_reviewed_at?->toISOString(),
            ])
            ->all();
    }
}
