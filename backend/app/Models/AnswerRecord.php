<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AnswerRecord extends Model
{
    use HasFactory;

    /**
     * AnswerRecords do not require their own timestamps.
     */
    public $timestamps = false;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'result_id',
        'question_id',
        'selected_choice_id',
        'is_correct',
        'time_taken_seconds',
        'question_text_snapshot',
        'selected_choice_text_snapshot',
        'correct_choice_text_snapshot',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'is_correct' => 'boolean',
    ];

    // -------------------------------------------------------------------------
    // Relationships
    // -------------------------------------------------------------------------

    public function result(): BelongsTo
    {
        return $this->belongsTo(ExamResult::class, 'result_id');
    }

    public function question(): BelongsTo
    {
        return $this->belongsTo(Question::class);
    }

    public function selectedChoice(): BelongsTo
    {
        return $this->belongsTo(Choice::class, 'selected_choice_id');
    }

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    public function __toString(): string
    {
        $status = $this->is_correct ? 'correct' : 'incorrect';
        return "AnswerRecord #{$this->id} — question #{$this->question_id} [{$status}]";
    }
}
