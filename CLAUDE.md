# CLAUDE.md

This file provides context and instructions for Claude Code when working in this repository.

## Project

Mock Exam System — a web-based certification exam practice platform for company employees in Japan.  
Supports IT certification categories (AWS, Network, Security, Linux) and **JLPT N1–N5** practice (文字語彙 and 文法読解 sections).

## Tech Stack

- Frontend: React (TypeScript), Tailwind CSS, Zustand, react-i18next
- Backend: Laravel 11 (PHP 8.2)
- Database: MySQL 8.0
- Authentication: JWT (tymon/jwt-auth)
- Containerization: Docker / Docker Compose

## Dev Commands

### Docker (recommended)
```bash
docker compose up --build
```

### Frontend (local)
```bash
cd frontend
npm install
npm run dev
```

### Backend (local)
```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan jwt:secret
php artisan migrate
php artisan db:seed
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
| `frontend/src/store/` | Global state (authStore, examSessionStore) |
| `frontend/src/i18n/` | Translation files (ja.json, en.json) |
| `backend/routes/api.php` | All API route definitions |
| `backend/app/Models/` | Eloquent models (User, Question, Passage, ExamSession, …) |
| `backend/app/Services/` | Business logic (ExamService, ResultService, AnalyticsService, PassageService) |
| `backend/app/Http/Controllers/Api/V1/` | Thin API controllers |
| `backend/database/migrations/` | Database schema migrations |
| `backend/database/seeders/` | Sample data (departments, users, questions, passages, JLPT questions, exam history) |
| `backend/config/` | Laravel configuration files |

## JLPT Structure

JLPT categories follow the pattern `JLPT-{level}-{section}`:

| Category | Section | Sub-types (question_type) |
|----------|---------|--------------------------|
| `JLPT-N5-文字語彙` … `JLPT-N1-文字語彙` | げんごちしき（もじ・ごい） | 問題1, 問題2, 問題3, 問題4, 問題5 |
| `JLPT-N5-文法読解` … `JLPT-N1-文法読解` | 言語知識（文法）・読解 | もんだい１, もんだい２, もんだい３, もんだい４, もんだい５, もんだい６ |

- `question_type` column on `questions` table drives in-session ordering (CASE WHEN sort in ExamService)
- 文法読解 questions with `passage_id` are grouped by passage in ExamService
- もんだい３–６ have associated `passages` records; もんだい１–２ do not
- Frontend `ReadingSession` page renders split-screen (passage left, question right) for 文法読解

## Seeder Order

```
DepartmentSeeder → UserSeeder → ExamSettingSeeder → QuestionSeeder
→ PassageSeeder → JLPTQuestionSeeder → ExamHistorySeeder
```

JLPTQuestionSeeder clears old JLPT questions before re-inserting, making it safe to re-run.

## Do NOT

- Run `php artisan migrate:fresh` on production — wipes the entire database
- Edit migration files manually — always use `php artisan make:migration`
- Commit `.env` or any file containing secrets
- Add business logic directly in controllers — use `Services`
- Call APIs directly inside React components — always go through `src/services/`
- Use `env()` directly in application code — always go through `config()`
- Hard-delete questions that have `answer_records` — use SoftDeletes
- Call `forceDelete()` on the query builder — it is an Eloquent-only method

## Notes

- See README.md for full feature list and architecture overview.
- API documentation (L5-Swagger): `http://localhost:8000/api/docs/`
- Docker container names: `mockexamsystem-backend-1`, `mockexamsystem-frontend-1`, `mockexamsystem-db-1`
- DB credentials (local dev): username `mock_exam`, password `secret`, database `mock_exam`
