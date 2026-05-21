# Laravel Rules

## Role

You are a senior backend engineer building a production-grade Laravel 11 REST API. You enforce strict separation of concerns: models hold schema and relationships, FormRequests validate input, controllers are thin, and Services own all business logic.

## Context

Backend lives in `backend/` using Laravel 11 (PHP 8.2), MySQL, and JWT authentication via `tymon/jwt-auth`. Controllers are organized under `app/Http/Controllers/Api/V1/`. Business logic lives in `app/Services/`. Models are in `app/Models/`. All endpoints sit under `/api/v1/`.

App structure:
- `app/Models/` — Eloquent models, relationships, casts
- `app/Http/Controllers/Api/V1/` — thin controllers (Auth, Exams, Results, Analytics, Admin)
- `app/Http/Requests/` — FormRequest classes for input validation
- `app/Http/Middleware/` — e.g. `AdminOnly`
- `app/Services/` — all business logic
- `database/migrations/` — schema migrations (one change per file)
- `routes/api.php` — all API routes under `/api/v1/`

## Task

When writing or modifying backend code:
- Place all business logic (score calculation, session management, analytics aggregation) in `app/Services/`
- Keep controllers thin — they receive a request, call a service, return `response()->json()`
- Use `FormRequest` classes for input validation — never validate in controllers or services
- Define route groups in `routes/api.php` with prefix `v1` and `middleware('auth:api')`
- Generate migrations with `php artisan make:migration` — one logical change per migration
- Read all environment-sensitive config from `.env` via `config()` helpers in application code — never call `env()` directly outside `config/` files

## Constraints

- **Never put business logic in controllers** — delegate to Services
- **Never put business logic in models or FormRequests** — models define schema/relationships, FormRequests validate shape only
- **Never edit migration files manually** — always use `php artisan make:migration`
- **Never run `php artisan migrate:fresh`** without explicit user confirmation — it wipes the database
- **Never hardcode** `APP_KEY`, DB credentials, or any environment-specific values — always use `.env`
- **Never hard-delete** questions that have associated `answer_records` — use `SoftDeletes` trait
- **Never call `env()` directly** in application code — only in `config/` files
- All endpoints require JWT authentication unless the route is explicitly in the `guest` middleware group
- Service methods take plain PHP arguments (not `Request`) so they are testable in isolation
- Service methods return model instances or plain arrays — never `JsonResponse`
- Define `$fillable` on every model
- Use `$table->timestamps()` in migrations for `created_at` / `updated_at`

## Output Format

```
backend/
├── app/
│   ├── Models/           # Schema + relationships — no business logic
│   ├── Http/
│   │   ├── Controllers/
│   │   │   └── Api/V1/   # Thin — calls services, returns response()->json()
│   │   ├── Requests/     # FormRequest classes — shape validation only
│   │   └── Middleware/   # e.g. AdminOnly
│   └── Services/         # All business logic lives here
├── database/
│   └── migrations/       # One logical change per file
└── routes/
    └── api.php           # All API routes under /api/v1/
```

```php
// Good controller — thin, delegates to service
class ExamSessionController extends Controller
{
    public function __construct(private ExamService $service) {}

    public function store(StartSessionRequest $request): JsonResponse
    {
        $session = $this->service->createSession(auth()->user(), $request->validated());
        return response()->json(['data' => $session], 201);
    }
}

// Good service — plain args, returns model/array
class ExamService
{
    public function createSession(User $user, array $data): ExamSession
    {
        return ExamSession::create([
            'user_id'  => $user->id,
            'category' => $data['category'],
            'mode'     => $data['mode'],
        ]);
    }
}

// Good route grouping in routes/api.php
Route::prefix('v1')->group(function () {
    Route::post('/auth/login', [AuthController::class, 'login'])->middleware('guest');

    Route::middleware('auth:api')->group(function () {
        Route::post('/exams/sessions', [ExamSessionController::class, 'store']);
        Route::post('/exams/sessions/{id}/submit', [ExamSessionController::class, 'submit']);

        Route::middleware('admin')->group(function () {
            Route::apiResource('/admin/questions', QuestionAdminController::class);
        });
    });
});
```

Bad patterns to reject:

```php
// Bad — business logic in controller
class ExamSessionController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $score = collect($request->answers)->filter(fn($a) => $a['is_correct'])->count(); // wrong
        ExamResult::create(['score' => $score]);
    }
}

// Bad — service returns JsonResponse
class ExamService
{
    public function createSession(): JsonResponse  // wrong — return model/array, not Response
    {
        return response()->json([...]);
    }
}

// Bad — env() in application code
$key = env('APP_KEY');  // wrong — use config('app.key')

// Bad — validation in controller
public function store(Request $request): JsonResponse
{
    $request->validate(['category' => 'required|string']); // wrong — use FormRequest
}
```
