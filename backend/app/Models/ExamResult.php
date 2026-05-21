<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ExamResult extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'session_id',
        'user_id',
        'score',
        'total_questions',
        'passing_score',
        'status',
        'completed_at',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'completed_at' => 'datetime',
    ];

    // -------------------------------------------------------------------------
    // Relationships
    // -------------------------------------------------------------------------

    public function session(): BelongsTo
    {
        return $this->belongsTo(ExamSession::class, 'session_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function answerRecords(): HasMany
    {
        return $this->hasMany(AnswerRecord::class, 'result_id');
    }

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    public function isPassed(): bool
    {
        return $this->status === 'pass';
    }

    public function percentageScore(): float
    {
        if ($this->total_questions === 0) {
            return 0.0;
        }

        return round(($this->score / $this->total_questions) * 100, 2);
    }

    public function __toString(): string
    {
        return "Result #{$this->id} — {$this->score}/{$this->total_questions} ({$this->status})";
    }
}
