<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Links the second paper of a JLPT N3/N4/N5 full-exam to the first paper.
     *
     * N3/N4/N5 full exams consist of two separate sessions (文字語彙 then 文法読解).
     * When the second session is started, its linked_session_id points to the first,
     * allowing the results page to surface a combined score across both papers.
     */
    public function up(): void
    {
        Schema::table('exam_sessions', function (Blueprint $table) {
            $table->foreignId('linked_session_id')
                ->nullable()
                ->after('is_submitted')
                ->constrained('exam_sessions')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('exam_sessions', function (Blueprint $table) {
            $table->dropForeign(['linked_session_id']);
            $table->dropColumn('linked_session_id');
        });
    }
};
