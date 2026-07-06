<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    // Creates the custom_flashcard_sets table so users can save a reusable multi-level study mix.
    public function up(): void
    {
        Schema::create('custom_flashcard_sets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('name', 100);
            $table->enum('type', ['kanji', 'vocab', 'grammar']);
            $table->json('levels');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('custom_flashcard_sets');
    }
};
