<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;

class ExamSession extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'user_id',
        'category',
        'time_limit_seconds',
        'mode',
        'question_type_filter',
        'completed_at',
        'is_submitted',
        'linked_session_id',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'is_submitted'         => 'boolean',
        'completed_at'         => 'datetime',
        'question_type_filter' => 'array',
    ];

    // -------------------------------------------------------------------------
    // Relationships
    // -------------------------------------------------------------------------

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function examResult(): HasOne
    {
        return $this->hasOne(ExamResult::class, 'session_id');
    }

    /** The other paper of a two-part JLPT full exam (N3/N4/N5). */
    public function linkedSession(): BelongsTo
    {
        return $this->belongsTo(ExamSession::class, 'linked_session_id');
    }

    public function answerRecords(): HasManyThrough
    {
        return $this->hasManyThrough(
            AnswerRecord::class,
            ExamResult::class,
            'session_id',   // FK on exam_results → exam_sessions
            'result_id',    // FK on answer_records → exam_results
            'id',           // local key on exam_sessions
            'id'            // local key on exam_results
        );
    }

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    public function isStudyMode(): bool
    {
        return $this->mode === 'study';
    }

    public function hasNoTimeLimit(): bool
    {
        return $this->time_limit_seconds === 0;
    }

    public function __toString(): string
    {
        return "Session #{$this->id} [{$this->mode}] — {$this->category}";
    }
}
