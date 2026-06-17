<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('flashcards', function (Blueprint $table) {
            $table->id();
            $table->enum('type', ['kanji', 'vocab', 'grammar']);
            $table->enum('level', ['N1', 'N2', 'N3', 'N4', 'N5']);
            $table->string('front', 100);
            $table->string('reading', 200)->nullable();
            $table->string('meaning', 500);
            $table->text('example_sentence')->nullable();
            $table->text('example_translation')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('flashcards');
    }
};
