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
- PDF Generation: mPDF 8.x (`mpdf/mpdf`) with IPAex Gothic TTF for Japanese
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
| `frontend/src/i18n/` | Translation files (ja.json, en.json) — language saved in `localStorage` key `i18n-lang` |
| `frontend/src/components/shared/QuestionCard.tsx` | Choice card — accepts `revealed` prop for inline study-mode feedback |
| `frontend/src/components/shared/Furigana.tsx` | Parses `{漢字\|よみ}` notation and renders HTML `<ruby>` elements |
| `frontend/src/components/shared/FlipCard.tsx` | Flip card used in FlashcardSession — uses `Furigana` for example sentences |
| `frontend/src/components/ui/Modal.tsx` | Modal dialog — accepts `wide` prop (`max-w-4xl`) for forms that need more space |
| `frontend/src/pages/NotFound.tsx` | 404 page — bilingual, auth-aware back button |
| `frontend/src/pages/admin/FlashcardImport.tsx` | Bulk Excel import for flashcards with column guide and furigana notation reference |
| `backend/routes/api.php` | All API route definitions |
| `backend/app/Models/` | Eloquent models (User, Question, Passage, ExamSession, Flashcard, …) |
| `backend/app/Services/` | Business logic (ExamService, ResultService, AnalyticsService, PassageService, FlashcardService) |
| `backend/app/Http/Controllers/Api/V1/` | Thin API controllers |
| `backend/database/migrations/` | Database schema migrations |
| `backend/database/seeders/` | Sample data (departments, users, questions, passages, JLPT questions, flashcards, exam history) |
| `backend/resources/views/pdf/result.blade.php` | Blade template for PDF export (mPDF) |
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
→ PassageSeeder → JLPTQuestionSeeder → FlashcardSeeder → ExamHistorySeeder
```

JLPTQuestionSeeder clears old JLPT questions before re-inserting, making it safe to re-run.  
FlashcardSeeder truncates and re-inserts all 150 cards (N1–N5, kanji/vocab/grammar), safe to re-run.

## Furigana Notation

Example sentences on flashcards support inline furigana using `{漢字|よみ}` notation stored in the database.

- `{今日|きょう}はいい{日|ひ}ですね。` → renders ruby text above each marked kanji
- Parsed by `frontend/src/components/shared/Furigana.tsx` using `split(/(\{[^}]+\|[^}]+\})/g)`
- Plain text segments fall through as `<span>` — the notation is optional per-word
- Used in: `FlipCard.tsx` (study session back face), `FlashcardImport.tsx` (live rendered demo)
- Admin flashcard form shows a live preview that renders furigana as the admin types
- The import page includes a notation guide with a side-by-side raw/rendered example

## Study Mode Behaviour

- `StudySession` and `ReadingSession` show inline feedback on the `QuestionCard` via `revealed={true}` after the user answers
- Correct choice → emerald green + ✓ badge; selected wrong choice → rose red + ✗ badge; others → dimmed
- Explanation (`解説`) shown below choices after answering
- On finish, `StudySession` navigates to `/exam/results/:id` (score page), not back to exam select
- Guard pattern: `isFinishing = useRef(false)` prevents the `useEffect` session-null guard from firing during intentional submit/navigate

## PDF Export

- Endpoint: `GET /api/v1/results/{id}/export` — returns a real PDF blob
- Library: `mpdf/mpdf ^8.3` (not dompdf)
- Japanese font: IPAex Gothic TTF at `/usr/share/fonts/opentype/ipaexfont-gothic/ipaexg.ttf`
  - Installed in Docker via `fonts-ipaexfont-gothic` (apt)
  - Do **not** use NotoSansCJK — it is a TTC collection and mPDF's TTFontFile parser fails on it
- Template: `backend/resources/views/pdf/result.blade.php`
- Filename format: `Result_{category}_{userName}.pdf` (sanitised — spaces → `_`, special chars stripped)
- mPDF temp/font cache: `backend/storage/app/mpdf_tmp/` — excluded from git via `.gitignore`
- Use plain ASCII characters in the Blade template for special symbols (e.g., `X` not `✗`) — Unicode glyphs outside the font's coverage render as blank squares

## Exam Session Exit Guard

- `ExamSession` does **not** use `useBlocker` — it is incompatible with `BrowserRouter` (requires a data router)
- Exit is guarded by: local `showExitModal` state + `window.beforeunload` listener + an explicit Exit button
- `handleSubmit` sets `isFinishing.current = true` before calling `resetSession()` to prevent the session-null guard from redirecting to `/exam/select`

## Do NOT

- Run `php artisan migrate:fresh` on production — wipes the entire database
- Edit migration files manually — always use `php artisan make:migration`
- Commit `.env` or any file containing secrets
- Add business logic directly in controllers — use `Services`
- Call APIs directly inside React components — always go through `src/services/`
- Use `env()` directly in application code — always go through `config()`
- Hard-delete questions that have `answer_records` — use SoftDeletes
- Call `forceDelete()` on the query builder — it is an Eloquent-only method
- Use `useBlocker` — the app uses `BrowserRouter`, not a data router; `useBlocker` will crash at runtime
- Use NotoSansCJK (TTC format) with mPDF — use IPAex Gothic (single TTF) instead
- Use Unicode special characters (`✗`, `✓`, etc.) in Blade PDF templates without verifying the font covers those code points

## Flashcard Import Endpoint

- Route: `POST /api/v1/admin/flashcards/import` (requires `auth:api` + `admin` middleware)
- Accepts: `multipart/form-data` with `file` field (.xlsx / .xls, max 10 MB)
- Columns: `type` · `level` · `front` · `reading` · `meaning` · `example_sentence` · `example_translation`
- Duplicate check: same `type` + `level` + `front` → skipped (not an error)
- Returns: `{ imported: N, duplicates: N, skipped: N, errors: [...] }`
- Frontend page: `/admin/flashcards/import` → `FlashcardImport.tsx`
- Service function: `importFlashcards(file)` in `frontend/src/services/flashcardService.ts`

## Docker Layout

Dockerfiles live next to their source code — not in a separate `docker/` folder:

| File | Build context |
|------|--------------|
| `backend/Dockerfile` | `./backend` |
| `frontend/Dockerfile` | `./frontend` |

Each directory also has its own `.dockerignore`. A root-level `.dockerignore` exists for any top-level Docker operations.

## i18n Language Persistence

- Selected language is saved to `localStorage` under the key `i18n-lang`
- `frontend/src/i18n/index.ts` reads this key on init: `lng: localStorage.getItem('i18n-lang') ?? 'ja'`
- `frontend/src/hooks/useLanguage.ts` writes to `localStorage` on every toggle
- This ensures the language choice survives page reloads and direct URL navigation

## Notes

- See README.md for full feature list and architecture overview.
- API documentation (L5-Swagger): `http://localhost:8000/api/docs/`
- Docker container names: `mockexamsystem-backend-1`, `mockexamsystem-frontend-1`, `mockexamsystem-db-1`
- DB credentials (local dev): username `mock_exam`, password `secret`, database `mock_exam`
