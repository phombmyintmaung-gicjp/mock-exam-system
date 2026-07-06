<?php

namespace App\Services;

use App\Models\Flashcard;
use App\Models\FlashcardBookmark;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;

class FlashcardBookmarkService
{
    public function list(User $user): Collection
    {
        $flashcardIds = FlashcardBookmark::where('user_id', $user->id)->pluck('flashcard_id');
        return Flashcard::whereIn('id', $flashcardIds)->orderBy('level')->orderBy('front')->get();
    }

    public function toggleOn(User $user, Flashcard $flashcard): FlashcardBookmark
    {
        return FlashcardBookmark::firstOrCreate([
            'user_id'      => $user->id,
            'flashcard_id' => $flashcard->id,
        ]);
    }

    public function toggleOff(User $user, Flashcard $flashcard): void
    {
        FlashcardBookmark::where('user_id', $user->id)
            ->where('flashcard_id', $flashcard->id)
            ->delete();
    }
}
