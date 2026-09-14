<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    // One-Login migration (2026-09): mockexam_users is retired entirely — "ALL USERS come
    // from [Main's] USERS TABLE." Every FK that used to point at mockexam_users.id is
    // repointed to the shared `users` table's own id instead. Existing rows are remapped
    // via employee_code (the natural key both tables share) rather than assuming the
    // numeric ids line up — mockexam_users and users are two independently
    // auto-incremented tables, so "id 7 in mockexam_users" has no relation at all to
    // "id 7 in users".
    private const FK_TABLES_CASCADE = [
        'exam_sessions', 'exam_results', 'flashcard_reviews',
        'custom_exam_sessions', 'custom_exam_results', 'flashcard_bookmarks',
        'custom_flashcard_sets',
    ];

    public function up(): void
    {
        // Build the remap BEFORE dropping the old FK constraints, while mockexam_users
        // still exists to join against.
        $map = DB::table('mockexam_users')
            ->join('employees', 'mockexam_users.employee_id', '=', 'employees.id')
            ->join('users', 'users.employee_code', '=', 'employees.employee_code')
            ->pluck('users.id', 'mockexam_users.id');

        foreach (self::FK_TABLES_CASCADE as $table) {
            Schema::table($table, function (Blueprint $t) {
                $t->dropForeign(['user_id']);
            });
        }
        Schema::table('custom_question_sets', function (Blueprint $t) {
            $t->dropForeign(['created_by']);
        });

        foreach ($map as $mockUserId => $sharedUserId) {
            foreach (self::FK_TABLES_CASCADE as $table) {
                DB::table($table)->where('user_id', $mockUserId)->update(['user_id' => $sharedUserId]);
            }
            DB::table('custom_question_sets')->where('created_by', $mockUserId)->update(['created_by' => $sharedUserId]);
        }

        // A mockexam_users row with no resolvable Main account (never linked, or linked to
        // an employee with no shared users row) can't be remapped. Every FK column here is
        // NOT NULL + cascadeOnDelete, so an unresolvable row is deleted outright — the same
        // outcome cascading the delete of the (about-to-be-dropped) mockexam_users row
        // itself would have produced.
        foreach (self::FK_TABLES_CASCADE as $table) {
            DB::table($table)->whereNotIn('user_id', DB::table('users')->select('id'))->delete();
        }
        DB::table('custom_question_sets')->whereNotIn('created_by', DB::table('users')->select('id'))->delete();

        foreach (self::FK_TABLES_CASCADE as $table) {
            Schema::table($table, function (Blueprint $t) {
                $t->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
            });
        }
        Schema::table('custom_question_sets', function (Blueprint $t) {
            $t->foreign('created_by')->references('id')->on('users')->cascadeOnDelete();
        });

        Schema::dropIfExists('mockexam_users');
    }

    public function down(): void
    {
        // Irreversible in practice — mockexam_users and its original id mapping are gone by
        // the time this would run. Only restores the FK shape enough that a rollback
        // doesn't error outright; does not restore dropped data or the table itself.
        foreach (self::FK_TABLES_CASCADE as $table) {
            Schema::table($table, function (Blueprint $t) {
                $t->dropForeign(['user_id']);
            });
        }
        Schema::table('custom_question_sets', function (Blueprint $t) {
            $t->dropForeign(['created_by']);
        });
    }
};
