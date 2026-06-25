<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ExamSetting extends Model
{
    protected $fillable = [
        'category',
        'category_id',
        'time_limit_seconds',
        'passing_score',
        'question_count',
    ];

    public function category(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(\App\Models\Category::class, 'category_id');
    }

    protected $casts = [
        'time_limit_seconds' => 'integer',
        'passing_score'      => 'integer',
        'question_count'     => 'integer',
    ];
}
