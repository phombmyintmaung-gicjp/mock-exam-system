<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    // Creates the flashcard_reviews table for spaced-repetition scheduling per user.
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
