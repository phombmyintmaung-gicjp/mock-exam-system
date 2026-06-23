<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class CustomExamSession extends Model
{
    protected $fillable = [
        'set_id',
        'user_id',
        'is_submitted',
        'completed_at',
    ];

    protected $casts = [
        'is_submitted' => 'boolean',
        'completed_at' => 'datetime',
    ];

    public function set(): BelongsTo
    {
        return $this->belongsTo(CustomQuestionSet::class, 'set_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function result(): HasOne
    {
        return $this->hasOne(CustomExamResult::class, 'session_id');
    }
}
