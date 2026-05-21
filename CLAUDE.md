# CLAUDE.md

This file provides context and instructions for Claude Code when working in this repository.

## Project

Mock Exam System — a web-based certification exam practice platform for company employees in Japan.

## Tech Stack

- Frontend: React (TypeScript), Tailwind CSS
- Backend: Laravel 11 (PHP 8.2)
- Database: MySQL
- Authentication: JWT (tymon/jwt-auth)

## Dev Commands

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Backend
```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan jwt:secret
php artisan migrate
php artisan serve
```

## Test Commands

### Frontend
```bash
cd frontend
npm run test
```

### Backend
```bash
cd backend
php artisan test
```

## Rules

Detailed conventions are in `.claude/rules/`:

| File | Covers |
|------|--------|
| [`typescript.md`](.claude/rules/typescript.md) | TypeScript compiler config, type definitions, import conventions |
| [`database-schema.md`](.claude/rules/database-schema.md) | MySQL table definitions and relationships |
| [`laravel.md`](.claude/rules/laravel.md) | App structure, controllers, services, migrations, auth |
| [`api.md`](.claude/rules/api.md) | Endpoint catalog, request/response format, Axios usage |
| [`react-components.md`](.claude/rules/react-components.md) | Component naming, directory layout, props, styling |
| [`i18n.md`](.claude/rules/i18n.md) | Translation keys, dual-file requirement, exam content exception |
| [`state-management.md`](.claude/rules/state-management.md) | Zustand stores, local vs global state, hook pattern |

## Key Files

| File | Purpose |
|------|---------|
| `frontend/src/App.tsx` | Root component and route definitions |
| `frontend/src/services/api.ts` | Axios instance with JWT interceptor |
| `frontend/src/store/` | Global state (auth, exam session) |
| `frontend/src/i18n/` | Translation files (ja.json, en.json) |
| `backend/routes/api.php` | All API route definitions |
| `backend/app/Models/` | Eloquent models (User, Question, ExamSession, etc.) |
| `backend/app/Services/` | Business logic (ExamService, ResultService, AnalyticsService) |
| `backend/app/Http/Controllers/Api/V1/` | Thin API controllers |
| `backend/database/migrations/` | Database schema migrations |
| `backend/config/` | Laravel configuration files |

## Do NOT

- Run `php artisan migrate:fresh` on production — wipes the entire database
- Edit migration files manually — always use `php artisan make:migration`
- Commit `.env` or any file containing secrets
- Add business logic directly in controllers — use `Services`
- Call APIs directly inside React components — always go through `src/services/`
- Use `env()` directly in application code — always go through `config()`

## Notes

- See README.md for full feature list and architecture overview.
- API documentation (L5-Swagger): `http://localhost:8000/api/docs/`
