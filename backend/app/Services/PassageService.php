<?php

namespace App\Services;

use App\Models\Passage;
use Illuminate\Pagination\LengthAwarePaginator;

class PassageService
{
    public function list(string $level = null): LengthAwarePaginator
    {
        $query = Passage::withCount('questions')->latest();
        if ($level) {
            $query->where('level', $level);
        }
        return $query->paginate(20);
    }

    public function create(array $data): Passage
    {
        return Passage::create($data);
    }

    public function update(Passage $passage, array $data): Passage
    {
        $passage->update($data);
        return $passage->fresh();
    }

    public function delete(Passage $passage): void
    {
        $passage->delete();
    }
}
