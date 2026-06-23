<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CustomQuestionSet extends Model
{
    protected $fillable = [
        'name',
        'description',
        'slug',
        'created_by',
        'time_limit_seconds',
        'passing_score',
        'is_active',
    ];

    protected $casts = [
        'time_limit_seconds' => 'integer',
        'passing_score'      => 'integer',
        'is_active'          => 'boolean',
    ];

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function questions(): BelongsToMany
    {
        return $this->belongsToMany(Question::class, 'custom_set_questions', 'set_id', 'question_id')
            ->withPivot('sort_order')
            ->orderByPivot('sort_order');
    }

    public function sessions(): HasMany
    {
        return $this->hasMany(CustomExamSession::class, 'set_id');
    }

    public function results(): HasMany
    {
        return $this->hasMany(CustomExamResult::class, 'set_id');
    }
}
