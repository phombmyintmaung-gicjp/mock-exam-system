<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CustomExamResult extends Model
{
    protected $fillable = [
        'session_id',
        'set_id',
        'user_id',
        'score',
        'total_questions',
        'passing_score',
        'status',
        'completed_at',
    ];

    protected $casts = [
        'completed_at' => 'datetime',
    ];

    public function session(): BelongsTo
    {
        return $this->belongsTo(CustomExamSession::class, 'session_id');
    }

    public function set(): BelongsTo
    {
        return $this->belongsTo(CustomQuestionSet::class, 'set_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function answerRecords(): HasMany
    {
        return $this->hasMany(CustomAnswerRecord::class, 'result_id');
    }
}
