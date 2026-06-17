<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\V1\Auth\AuthController;
use App\Http\Controllers\Api\V1\QuestionController;
use App\Http\Controllers\Api\V1\ExamSessionController;
use App\Http\Controllers\Api\V1\ResultController;
use App\Http\Controllers\Api\V1\AnalyticsController;
use App\Http\Controllers\Api\V1\Admin\QuestionAdminController;
use App\Http\Controllers\Api\V1\Admin\UserAdminController;
use App\Http\Controllers\Api\V1\Admin\DepartmentController;
use App\Http\Controllers\Api\V1\Admin\ExamSettingController;
use App\Http\Controllers\Api\V1\Admin\PassageController;
use App\Http\Controllers\Api\V1\Admin\CategoryController;
use App\Http\Controllers\Api\V1\Admin\ResultAdminController;
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
    // Public auth routes
    // -------------------------------------------------------------------------
    Route::prefix('auth')->group(function () {
        Route::post('login', [AuthController::class, 'login'])->name('auth.login');
        Route::post('register', [AuthController::class, 'register'])->name('auth.register');
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

        // Exam questions
        Route::get('exams/questions', [QuestionController::class, 'index'])->name('exams.questions.index');

        // Exam sessions
        Route::post('exams/sessions', [ExamSessionController::class, 'store'])->name('exams.sessions.store');
        Route::post('exams/sessions/{id}/submit', [ExamSessionController::class, 'submit'])->name('exams.sessions.submit');

        // Results
        Route::get('results', [ResultController::class, 'index'])->name('results.index');
        Route::get('results/{id}', [ResultController::class, 'show'])->name('results.show');
        Route::get('results/{id}/export', [ResultController::class, 'export'])->name('results.export');

        // Analytics
        Route::prefix('analytics')->group(function () {
            Route::get('category-stats', [AnalyticsController::class, 'categoryStats'])->name('analytics.category-stats');
            Route::get('weak-areas', [AnalyticsController::class, 'weakAreas'])->name('analytics.weak-areas');
            Route::get('score-trend', [AnalyticsController::class, 'scoreTrend'])->name('analytics.score-trend');
        });

        // -------------------------------------------------------------------------
        // Admin-only routes
        // -------------------------------------------------------------------------
        Route::middleware('admin')->prefix('admin')->group(function () {

            // Question management
            Route::get('questions', [QuestionAdminController::class, 'index'])->name('admin.questions.index');
            Route::post('questions', [QuestionAdminController::class, 'store'])->name('admin.questions.store');
            Route::post('questions/import', [QuestionAdminController::class, 'import'])->name('admin.questions.import');
            Route::get('questions/{id}', [QuestionAdminController::class, 'show'])->name('admin.questions.show');
            Route::put('questions/{id}', [QuestionAdminController::class, 'update'])->name('admin.questions.update');
            Route::delete('questions/{id}', [QuestionAdminController::class, 'destroy'])->name('admin.questions.destroy');

            // Departments
            Route::get('departments', [DepartmentController::class, 'index'])->name('admin.departments.index');

            // User management
            Route::get('users', [UserAdminController::class, 'index'])->name('admin.users.index');
            Route::post('users', [UserAdminController::class, 'store'])->name('admin.users.store');
            Route::get('users/{id}', [UserAdminController::class, 'show'])->name('admin.users.show');
            Route::put('users/{id}', [UserAdminController::class, 'update'])->name('admin.users.update');

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

            // Reading passages
            Route::get('passages', [PassageController::class, 'index'])->name('admin.passages.index');
            Route::post('passages', [PassageController::class, 'store'])->name('admin.passages.store');
            Route::get('passages/{id}', [PassageController::class, 'show'])->name('admin.passages.show');
            Route::put('passages/{id}', [PassageController::class, 'update'])->name('admin.passages.update');
            Route::delete('passages/{id}', [PassageController::class, 'destroy'])->name('admin.passages.destroy');
        });
    });
});
