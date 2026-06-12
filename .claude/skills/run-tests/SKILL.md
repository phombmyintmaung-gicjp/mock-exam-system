# Skill: run-tests

Run the frontend and backend test suites for the Mock Exam System.

## Frontend tests (Vitest)

```bash
# Docker
docker compose exec frontend npm run test

# Local
cd frontend && npm run test
```

## Backend tests (PHPUnit via Artisan)

```bash
# Docker
docker compose exec backend php artisan test

# Local
cd backend && php artisan test

# Run a specific test file
docker compose exec backend php artisan test --filter=AuthTest

# Run with coverage (requires Xdebug or pcov)
docker compose exec backend php artisan test --coverage
```

## Before pushing — run both

```bash
docker compose exec frontend npm run test
docker compose exec backend php artisan test
```

## TypeScript type-check (no emitting)

```bash
# Docker
docker compose exec frontend npm run build -- --noEmit

# Local
cd frontend && npx tsc --noEmit
```

TypeScript compiler flags in `tsconfig.json`:
- `strict: true` — all strict checks
- `noUnusedLocals: true` — unused vars are errors
- `noUnusedParameters: true` — unused params are errors

## What counts as passing

| Check | Must pass before commit |
|-------|------------------------|
| `npm run test` | Yes |
| `php artisan test` | Yes |
| `tsc --noEmit` | Yes — no type errors |
| Browser smoke test (login → take exam → see result) | Yes for feature work |

## Test file locations

| Type | Location |
|------|---------|
| Frontend unit/component tests | `frontend/src/**/*.test.tsx` |
| Backend feature tests | `backend/tests/Feature/` |
| Backend unit tests | `backend/tests/Unit/` |

## Creating a new backend test

```bash
docker compose exec backend php artisan make:test Feature/ExamSessionTest
docker compose exec backend php artisan make:test Unit/ExamServiceTest --unit
```

## Notes

- Backend tests use Laravel's in-memory SQLite by default when `DB_CONNECTION=sqlite`
  is set in `phpunit.xml` — they do not touch the real MySQL database.
- Never mock the database in feature tests — use `RefreshDatabase` trait for a clean
  state per test.
- If a test fails due to JWT issues, ensure `JWT_SECRET` is set in `phpunit.xml`
  or the test environment.
