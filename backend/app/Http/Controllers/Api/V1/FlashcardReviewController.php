<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Flashcard;
use App\Services\FlashcardReviewService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FlashcardReviewController extends Controller
{
    public function __construct(private FlashcardReviewService $service) {}

    /**
     * GET /study/flashcards/due
     * Returns flashcards due for review (next_review_at <= now) + unseen cards.
     * Requires authentication.
     */
    public function due(Request $request): JsonResponse
    {
        /** @var \App\Models\User $user */
        $user   = auth()->user();
        $levels = $request->query('level') ? explode(',', $request->query('level')) : [];
        $cards  = $this->service->getDueCards(
            $user,
            $request->query('type'),
            $levels,
            (int) ($request->query('limit', 50))
        );

        $states = $this->service->getReviewStates($user, $cards->pluck('id')->all());

        $data = $cards->map(function ($card) use ($states) {
            $arr = $card->toArray();
            $arr['review_state'] = $states[$card->id] ?? null;
            return $arr;
        });

        return response()->json([
            'data'  => $data,
            'count' => count($data),
        ]);
    }

    /**
     * POST /study/flashcards/{id}/review
     * Record a SM-2 review for a flashcard.
     * Body: { rating: 0|1|2|3 }  (0=Again, 1=Hard, 2=Good, 3=Easy)
     */
    public function store(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'rating' => ['required', 'integer', 'min:0', 'max:3'],
        ]);

        /** @var \App\Models\User $user */
        $user      = auth()->user();
        $flashcard = Flashcard::findOrFail($id);
        $review    = $this->service->review($user, $flashcard, (int) $request->input('rating'));

        return response()->json(['data' => $review]);
    }
}
