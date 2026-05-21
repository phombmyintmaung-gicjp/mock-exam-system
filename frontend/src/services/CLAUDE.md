# frontend/src/services/

All API call functions and the shared Axios instance.

## Key File

`api.ts` — Axios instance configured with:
- `baseURL`: `/api/v1/`
- Request interceptor: attaches `Authorization: Bearer <token>` from the auth store
- Response interceptor: handles 401 (token expired → refresh or redirect to login)

## Service Files

| File | Covers |
|------|--------|
| `api.ts` | Axios instance and interceptors |
| `authService.ts` | Login, logout, token refresh |
| `examService.ts` | Fetch questions, start/submit exam session |
| `questionService.ts` | CRUD for questions (admin), bulk import |
| `resultService.ts` | Fetch results, export PDF |
| `analyticsService.ts` | Fetch stats, pass/fail rates, weak areas |
| `userService.ts` | Fetch/update user profile, department info |

## Response Shape

All backend responses follow:
```ts
// Success
{ data: T }

// Error
{ error: string }
```
