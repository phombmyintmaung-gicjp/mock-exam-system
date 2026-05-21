# API Rules

## Role

You are a senior full-stack engineer responsible for the contract between the React frontend and Laravel 11 backend. You enforce consistent request/response shapes, proper JWT handling, and the rule that all API calls go through the shared Axios instance.

## Context

The backend exposes a RESTful API under `/api/v1/`. All responses follow a consistent envelope format. The frontend accesses the API exclusively through `src/services/api.ts`, which is an Axios instance that automatically injects the JWT token and redirects to `/login` on 401. API documentation is available at `http://localhost:8000/api/docs/`.

API conventions:
- Base URL prefix: `/api/v1/`
- Auth header: `Authorization: Bearer <token>`
- Content-Type: `application/json`

## Task

When adding or modifying API endpoints:
- Register the route in `backend/routes/api.php` inside the appropriate middleware group
- Implement the controller in `app/Http/Controllers/Api/V1/` (thin — delegates to a Service)
- Return the correct response envelope using `response()->json(['data' => ...])`
- Document the endpoint in this file under the correct section

When writing frontend code that fetches data:
- Call a function in `src/services/` — never call `fetch`, `axios`, or `api` directly from a component
- Type the response with `ApiResponse<T>` or `PaginatedResponse<T>` from `src/types/api.ts`

## Constraints

- **Never call `fetch`, `axios`, or `api` directly** inside a React component or hook — always go through `src/services/`
- **All endpoints require JWT authentication** unless the route is in the `guest` middleware group
- **Always wrap responses** in the correct envelope — never return a bare object or array
- **Paginated endpoints** must include `count`, `next`, and `previous` alongside `data`
- Frontend must use `ApiResponse<T>` / `PaginatedResponse<T>` — never `any`

## Output Format

### Response envelopes

```json
// Success
{ "data": { ... } }

// Error
{ "error": "Human-readable message" }

// Paginated
{
  "data": [...],
  "count": 42,
  "next": "/api/v1/results?page=2",
  "previous": null
}
```

### Backend controller + route

```php
// routes/api.php
Route::prefix('v1')->middleware('auth:api')->group(function () {
    Route::get('/exams/questions', [QuestionController::class, 'index']);
});

// app/Http/Controllers/Api/V1/QuestionController.php
public function index(Request $request): JsonResponse
{
    $questions = $this->questionService->list($request->query('category'));
    return response()->json(['data' => $questions]);
}
```

### Frontend service call

```ts
// src/services/examService.ts
import api from './api';
import type { ApiResponse, PaginatedResponse } from '@/types/api';
import type { Question } from '@/types/exam';

async function listQuestions(category?: string): Promise<PaginatedResponse<Question>> {
  const res = await api.get('/exams/questions', { params: { category } });
  return res.data;
}
```

Bad patterns to reject:

```tsx
// Bad — direct axios in component
const res = await axios.post('/api/v1/exams/sessions/1/submit', answers);

// Bad — bare response (no envelope)
return response()->json($sessionData);  // should be response()->json(['data' => $sessionData])

// Bad — untyped response
const res: any = await api.get('/users/1');
```

## Endpoint Catalog

### Auth (public)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/v1/auth/login/` | Obtain JWT token |
| POST | `/api/v1/auth/logout/` | Invalidate token |
| POST | `/api/v1/auth/refresh/` | Refresh JWT token |

### Exams

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/exams/questions/` | List questions (filter: `?category=`) |
| POST | `/api/v1/exams/sessions/` | Start an exam session |
| POST | `/api/v1/exams/sessions/{id}/submit/` | Submit answers, get result |

### Results

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/results/` | List user's past results |
| GET | `/api/v1/results/{id}/` | Get a specific result |
| GET | `/api/v1/results/{id}/export/` | Download result as PDF (blob) |

### Analytics

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/analytics/category-stats/` | Pass/fail counts by category |
| GET | `/api/v1/analytics/weak-areas/` | Accuracy by category for current user |
| GET | `/api/v1/analytics/score-trend/` | Score history over time |

### Admin — Questions

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/admin/questions/` | List all questions |
| POST | `/api/v1/admin/questions/` | Create question |
| GET | `/api/v1/admin/questions/{id}/` | Get question detail |
| PUT | `/api/v1/admin/questions/{id}/` | Update question |
| DELETE | `/api/v1/admin/questions/{id}/` | Delete question |
| POST | `/api/v1/admin/questions/import/` | Bulk import (CSV/JSON) |

### Admin — Users

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/admin/users/` | List all users |
| POST | `/api/v1/admin/users/` | Create user |
| GET | `/api/v1/admin/users/{id}/` | Get user detail |
| PUT | `/api/v1/admin/users/{id}/` | Update user |

### Admin — Exam Settings

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/admin/exam-settings/` | Get exam config |
| PUT | `/api/v1/admin/exam-settings/` | Update exam config |
