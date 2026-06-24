<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Spaced repetition (SM-2) review state per user per flashcard.
     *
     * Each row tracks where the user is in the SM-2 algorithm for one card:
     *   - interval_days  — current inter-review interval (days)
     *   - ease_factor    — difficulty multiplier (min 1.3, default 2.5)
     *   - repetitions    — consecutive successful reviews without reset
     *   - next_review_at — when this card is next due
     */
    public function up(): void
    {
        Schema::create('flashcard_reviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('flashcard_id')->constrained()->cascadeOnDelete();
            $table->integer('interval_days')->default(1);
            $table->float('ease_factor')->default(2.5);
            $table->integer('repetitions')->default(0);
            $table->timestamp('next_review_at')->useCurrent();
            $table->timestamp('last_reviewed_at')->nullable();
            $table->timestamps();

            $table->unique(['user_id', 'flashcard_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('flashcard_reviews');
    }
};
