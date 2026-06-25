<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Flashcard extends Model
{
    protected $fillable = [
        'type',
        'level',
        'front',
        'reading',
        'meaning',
        'meaning_my',
        'example_sentence',
        'example_translation',
        'frequency_band',
    ];
}
