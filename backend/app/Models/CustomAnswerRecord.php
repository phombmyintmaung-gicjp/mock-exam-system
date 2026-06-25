<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CustomAnswerRecord extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'result_id',
        'question_id',
        'selected_choice_id',
        'is_correct',
    ];

    protected $casts = [
        'is_correct' => 'boolean',
    ];

    public function question(): BelongsTo
    {
        return $this->belongsTo(Question::class)->withTrashed();
    }

    public function selectedChoice(): BelongsTo
    {
        return $this->belongsTo(Choice::class, 'selected_choice_id');
    }
}
