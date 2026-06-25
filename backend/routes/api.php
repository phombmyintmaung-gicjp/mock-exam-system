<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\V1\Auth\AuthController;
use App\Http\Controllers\Api\V1\QuestionController;
use App\Http\Controllers\Api\V1\ExamSessionController;
use App\Http\Controllers\Api\V1\ResultController;
use App\Http\Controllers\Api\V1\AnalyticsController;
use App\Http\Controllers\Api\V1\Admin\QuestionAdminController;
use App\Http\Controllers\Api\V1\Admin\UserAdminController;
use App\Http\Controllers\Api\V1\Admin\ExamSettingController;
use App\Http\Controllers\Api\V1\Admin\PassageController;
use App\Http\Controllers\Api\V1\Admin\CategoryController;
use App\Http\Controllers\Api\V1\Admin\ResultAdminController;
use App\Http\Controllers\Api\V1\Admin\FlashcardAdminController;
use App\Http\Controllers\Api\V1\Admin\CustomSetController;
use App\Http\Controllers\Api\V1\CustomExamController;
use App\Http\Controllers\Api\V1\FlashcardController;
use App\Http\Controllers\Api\V1\FlashcardReviewController;
use App\Http\Controllers\Api\V1\ProfileController;

/*
|--------------------------------------------------------------------------
| API Routes — Mock Exam System
|--------------------------------------------------------------------------
|
| All routes are prefixed with /api (set in bootstrap/app.php).
| Within this file, routes are nested under /v1/.
|
*/

Route::prefix('v1')->group(function () {

    // -------------------------------------------------------------------------
    // Public study routes (no auth required)
    // -------------------------------------------------------------------------
    Route::get('study/flashcards', [FlashcardController::class, 'index'])->name('study.flashcards.index');

    // SRS review routes (auth required — placed here to register before the wildcard {id} in the auth block)
    Route::middleware('auth:api')->group(function () {
        Route::get('study/flashcards/due', [FlashcardReviewController::class, 'due'])->name('study.flashcards.due');
        Route::post('study/flashcards/{id}/review', [FlashcardReviewController::class, 'store'])->name('study.flashcards.review');
    });

    // -------------------------------------------------------------------------
    // Public auth routes
    // -------------------------------------------------------------------------
    Route::prefix('auth')->group(function () {
        Route::post('login', [AuthController::class, 'login'])->name('auth.login')->middleware('throttle:login');
        Route::post('register', [AuthController::class, 'register'])->name('auth.register')->middleware('throttle:login');
    });

    // -------------------------------------------------------------------------
    // Authenticated routes
    // -------------------------------------------------------------------------
    Route::middleware('auth:api')->group(function () {

        // User profile (all authenticated users)
        Route::get('profile', [ProfileController::class, 'show'])->name('profile.show');
        Route::patch('profile', [ProfileController::class, 'update'])->name('profile.update');
        Route::patch('profile/password', [ProfileController::class, 'changePassword'])->name('profile.password');

        // Auth management
        Route::prefix('auth')->group(function () {
            Route::post('logout', [AuthController::class, 'logout'])->name('auth.logout');
            Route::post('refresh', [AuthController::class, 'refresh'])->name('auth.refresh');
        });

        // IT categories (non-JLPT) — accessible to all authenticated users
        Route::get('categories', [CategoryController::class, 'publicIndex'])->name('categories.public');

        // Exam questions
        Route::get('exams/questions', [QuestionController::class, 'index'])->name('exams.questions.index');

        // Exam sessions
        Route::post('exams/sessions', [ExamSessionController::class, 'store'])->name('exams.sessions.store');
        Route::post('exams/sessions/{id}/submit', [ExamSessionController::class, 'submit'])->name('exams.sessions.submit');

        // Results
        Route::get('results', [ResultController::class, 'index'])->name('results.index');
        Route::get('results/{id}', [ResultController::class, 'show'])->name('results.show');
        Route::get('results/{id}/combined', [ResultController::class, 'combined'])->name('results.combined');
        Route::get('results/{id}/export', [ResultController::class, 'export'])->name('results.export');

        // Analytics
        Route::prefix('analytics')->group(function () {
            Route::get('category-stats', [AnalyticsController::class, 'categoryStats'])->name('analytics.category-stats');
            Route::get('weak-areas', [AnalyticsController::class, 'weakAreas'])->name('analytics.weak-areas');
            Route::get('score-trend', [AnalyticsController::class, 'scoreTrend'])->name('analytics.score-trend');
            Route::get('retry-stats', [AnalyticsController::class, 'retryStats'])->name('analytics.retry-stats');
        });

        // -------------------------------------------------------------------------
        // Admin-only routes
        // -------------------------------------------------------------------------
        Route::middleware('admin')->prefix('admin')->group(function () {

            // Admin analytics
            Route::get('analytics/difficult-questions', [AnalyticsController::class, 'difficultQuestions'])->name('admin.analytics.difficult-questions');

            // Question management
            Route::get('questions', [QuestionAdminController::class, 'index'])->name('admin.questions.index');
            Route::post('questions', [QuestionAdminController::class, 'store'])->name('admin.questions.store');
            Route::post('questions/import', [QuestionAdminController::class, 'import'])->name('admin.questions.import');
            Route::get('questions/{id}', [QuestionAdminController::class, 'show'])->name('admin.questions.show');
            Route::put('questions/{id}', [QuestionAdminController::class, 'update'])->name('admin.questions.update');
            Route::delete('questions/{id}', [QuestionAdminController::class, 'destroy'])->name('admin.questions.destroy');

            // User management
            Route::get('users', [UserAdminController::class, 'index'])->name('admin.users.index');
            Route::post('users', [UserAdminController::class, 'store'])->name('admin.users.store');
            Route::get('users/{id}', [UserAdminController::class, 'show'])->name('admin.users.show');
            Route::put('users/{id}', [UserAdminController::class, 'update'])->name('admin.users.update');
            Route::delete('users/{id}', [UserAdminController::class, 'destroy'])->name('admin.users.destroy');
            Route::post('users/{id}/approve', [UserAdminController::class, 'approve'])->name('admin.users.approve');
            Route::post('users/{id}/reject', [UserAdminController::class, 'reject'])->name('admin.users.reject');

            // Exam settings (per-category)
            Route::get('exam-settings', [ExamSettingController::class, 'index'])->name('admin.exam-settings.index');
            Route::put('exam-settings/{category}', [ExamSettingController::class, 'update'])->name('admin.exam-settings.update');

            // Categories
            Route::get('categories', [CategoryController::class, 'index'])->name('admin.categories.index');
            Route::post('categories', [CategoryController::class, 'store'])->name('admin.categories.store');
            Route::put('categories/{id}', [CategoryController::class, 'update'])->name('admin.categories.update');
            Route::delete('categories/{id}', [CategoryController::class, 'destroy'])->name('admin.categories.destroy');

            // Results (all users)
            Route::get('results', [ResultAdminController::class, 'index'])->name('admin.results.index');
            Route::get('results/{id}', [ResultAdminController::class, 'show'])->name('admin.results.show');

            // Flashcard management
            Route::get('flashcards', [FlashcardAdminController::class, 'index'])->name('admin.flashcards.index');
            Route::post('flashcards', [FlashcardAdminController::class, 'store'])->name('admin.flashcards.store');
            Route::post('flashcards/import', [FlashcardAdminController::class, 'import'])->name('admin.flashcards.import');
            Route::put('flashcards/{id}', [FlashcardAdminController::class, 'update'])->name('admin.flashcards.update');
            Route::delete('flashcards/{id}', [FlashcardAdminController::class, 'destroy'])->name('admin.flashcards.destroy');

            // Reading passages
            Route::get('passages', [PassageController::class, 'index'])->name('admin.passages.index');
            Route::post('passages', [PassageController::class, 'store'])->name('admin.passages.store');
            Route::get('passages/{id}', [PassageController::class, 'show'])->name('admin.passages.show');
            Route::put('passages/{id}', [PassageController::class, 'update'])->name('admin.passages.update');
            Route::delete('passages/{id}', [PassageController::class, 'destroy'])->name('admin.passages.destroy');

            // Custom question sets
            Route::get('custom-sets', [CustomSetController::class, 'index'])->name('admin.custom-sets.index');
            Route::post('custom-sets', [CustomSetController::class, 'store'])->name('admin.custom-sets.store');
            Route::post('custom-sets/import', [CustomSetController::class, 'importFromExcel'])->name('admin.custom-sets.import');
            Route::get('custom-sets/{id}', [CustomSetController::class, 'show'])->name('admin.custom-sets.show');
            Route::put('custom-sets/{id}', [CustomSetController::class, 'update'])->name('admin.custom-sets.update');
            Route::delete('custom-sets/{id}', [CustomSetController::class, 'destroy'])->name('admin.custom-sets.destroy');
            Route::post('custom-sets/{id}/questions', [CustomSetController::class, 'addQuestion'])->name('admin.custom-sets.questions.add');
            Route::delete('custom-sets/{id}/questions/{questionId}', [CustomSetController::class, 'removeQuestion'])->name('admin.custom-sets.questions.remove');
            Route::post('custom-sets/{id}/questions/create', [CustomSetController::class, 'createQuestion'])->name('admin.custom-sets.questions.create');
            Route::put('custom-sets/{id}/reorder', [CustomSetController::class, 'reorder'])->name('admin.custom-sets.reorder');
            Route::get('custom-sets/{id}/results', [CustomSetController::class, 'results'])->name('admin.custom-sets.results');
            Route::get('custom-sets/{setId}/results/{resultId}', [CustomSetController::class, 'showResult'])->name('admin.custom-sets.results.show');
        });

        // Custom exam sessions (employee-facing, auth required, not admin-only)
        Route::prefix('custom-exams')->group(function () {
            Route::get('{slug}', [CustomExamController::class, 'show'])->name('custom-exams.show');
            Route::get('{slug}/my-results', [CustomExamController::class, 'myResults'])->name('custom-exams.my-results');
            Route::post('{slug}/sessions', [CustomExamController::class, 'startSession'])->name('custom-exams.sessions.start');
            Route::post('sessions/{id}/submit', [CustomExamController::class, 'submitSession'])->name('custom-exams.sessions.submit');
            Route::get('results/{id}', [CustomExamController::class, 'getResult'])->name('custom-exams.results.show');
        });
    });
});
