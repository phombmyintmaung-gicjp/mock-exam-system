<?php

namespace App\Services;

use App\Models\Flashcard;
use Illuminate\Pagination\LengthAwarePaginator;

class FlashcardService
{
    public function list(?string $type, ?string $level): LengthAwarePaginator
    {
        $query = Flashcard::query()->orderBy('level')->orderBy('front');
        if ($type)  $query->where('type',  $type);
        if ($level) $query->where('level', $level);
        return $query->paginate(200);
    }

    public function create(array $data): Flashcard
    {
        return Flashcard::create($data);
    }

    public function update(Flashcard $flashcard, array $data): Flashcard
    {
        $flashcard->update($data);
        return $flashcard->fresh();
    }

    public function delete(Flashcard $flashcard): void
    {
        $flashcard->delete();
    }
}
