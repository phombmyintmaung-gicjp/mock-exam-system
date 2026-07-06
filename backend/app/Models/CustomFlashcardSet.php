<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CustomFlashcardSet extends Model
{
    protected $fillable = [
        'user_id',
        'name',
        'type',
        'levels',
    ];

    protected $casts = [
        'levels' => 'array',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
