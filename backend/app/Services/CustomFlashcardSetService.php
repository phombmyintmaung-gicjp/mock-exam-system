<?php

namespace App\Services;

use App\Models\CustomFlashcardSet;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;

class CustomFlashcardSetService
{
    public function list(User $user, ?string $type = null): Collection
    {
        $query = CustomFlashcardSet::where('user_id', $user->id)->orderBy('name');
        if ($type) $query->where('type', $type);
        return $query->get();
    }

    public function create(User $user, array $data): CustomFlashcardSet
    {
        return CustomFlashcardSet::create([
            'user_id' => $user->id,
            'name'    => $data['name'],
            'type'    => $data['type'],
            'levels'  => $data['levels'],
        ]);
    }

    public function delete(CustomFlashcardSet $set): void
    {
        $set->delete();
    }
}
