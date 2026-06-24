<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FlashcardReview extends Model
{
    protected $fillable = [
        'user_id',
        'flashcard_id',
        'interval_days',
        'ease_factor',
        'repetitions',
        'next_review_at',
        'last_reviewed_at',
    ];

    protected $casts = [
        'next_review_at'   => 'datetime',
        'last_reviewed_at' => 'datetime',
        'ease_factor'      => 'float',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function flashcard(): BelongsTo
    {
        return $this->belongsTo(Flashcard::class);
    }
}
