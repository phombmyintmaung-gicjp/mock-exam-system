<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ExamSetting extends Model
{
    protected $fillable = [
        'category',
        'time_limit_seconds',
        'passing_score',
        'question_count',
    ];

    protected $casts = [
        'time_limit_seconds' => 'integer',
        'passing_score'      => 'integer',
        'question_count'     => 'integer',
    ];
}
