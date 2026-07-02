<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    // Creates the flashcards table for JLPT vocabulary/kanji/grammar study cards.
    public function up(): void
    {
        Schema::create('flashcards', function (Blueprint $table) {
            $table->id();
            $table->enum('type', ['kanji', 'vocab', 'grammar']);
            $table->enum('level', ['N1', 'N2', 'N3', 'N4', 'N5']);
            $table->string('front', 100);
            $table->string('reading', 200)->nullable();
            $table->string('meaning', 500);
            $table->string('meaning_my', 500)->nullable();
            $table->text('example_sentence')->nullable();
            $table->text('example_translation')->nullable();
            $table->tinyInteger('frequency_band')->unsigned()->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('flashcards');
    }
};
