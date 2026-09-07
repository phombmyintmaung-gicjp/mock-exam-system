<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    // Database consolidation (CLAUDE.md "Database Consolidation"): Mock Exam shares
    // one physical MySQL database with Main and DTS. `users` is renamed to
    // `mockexam_users` so the name never collides with Main's own `users` table once
    // both live in the same schema; every FK previously pointing at `users`
    // (exam_sessions.user_id, exam_results.user_id, flashcard_reviews.user_id,
    // custom_exam_sessions.user_id, custom_exam_results.user_id,
    // custom_answer_records.user_id, flashcard_bookmarks.user_id,
    // custom_flashcard_sets.user_id, answer_records via exam_sessions) is
    // automatically re-pointed at `mockexam_users` by MySQL as part of the rename —
    // no separate FK migration needed. A new nullable `employee_id` links a Mock
    // Exam account to the company-wide shared `employees` table (Main-owned) —
    // nullOnDelete, since an employee leaving the company must never delete their
    // exam-practice history. Every account created from this point on must resolve
    // a real employee_code at registration (see AuthService::register()); existing
    // (legacy) accounts start out unlinked and are reconciled via the
    // mockexam:reconcile-employees command, never auto-linked.
    public function up(): void
    {
        Schema::rename('users', 'mockexam_users');

        Schema::table('mockexam_users', function (Blueprint $table) {
            $table->foreignId('employee_id')->nullable()->after('id')
                  ->constrained('employees')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('mockexam_users', function (Blueprint $table) {
            $table->dropForeign(['employee_id']);
            $table->dropColumn('employee_id');
        });

        Schema::rename('mockexam_users', 'users');
    }
};
