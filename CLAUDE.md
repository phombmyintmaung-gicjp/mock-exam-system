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
| `frontend/src/components/shared/ExamSecurityNotice.tsx` | Acknowledgment screen shown before exam starts; gates anti-cheat activation |
| `frontend/src/components/shared/ExamViolationModal.tsx` | Per-violation warning modal shown during exam |
| `frontend/src/hooks/useExamSecurity.ts` | Detects window blur / tab switch / focus loss; fires `onAutoSubmit` at threshold |
| `frontend/src/components/ui/Modal.tsx` | Modal dialog — accepts `wide` prop (`max-w-4xl`) for forms that need more space |
| `frontend/src/pages/NotFound.tsx` | 404 page — bilingual, auth-aware back button |
| `frontend/src/pages/admin/FlashcardImport.tsx` | Bulk Excel import for flashcards with column guide and furigana notation reference |
| `frontend/src/pages/admin/CustomSetList.tsx` | Admin list of custom exam sets with copy-link action |
| `frontend/src/pages/admin/CustomSetEditor.tsx` | Create / edit a custom set — question picker, slug, time limit, passing score |
| `frontend/src/pages/admin/CustomSetResults.tsx` | List employee submissions for a set — search + pass/fail filter |
| `frontend/src/pages/admin/CustomSetResultDetail.tsx` | Per-question answer breakdown for a single submission (admin only) |
| `frontend/src/pages/client/CustomExamLanding.tsx` | Employee landing page for a custom exam link |
| `frontend/src/pages/client/CustomExamSession.tsx` | Custom exam session with anti-cheat identical to ExamSession |
| `frontend/src/pages/client/CustomExamResult.tsx` | Score-only result page — no answer review for employees |
| `frontend/src/services/customSetService.ts` | All API calls for custom sets (admin + employee) |
| `frontend/src/types/customSet.ts` | TypeScript interfaces for custom set domain |
| `backend/routes/api.php` | All API route definitions |
| `backend/app/Models/` | Eloquent models (User, Question, Passage, ExamSession, Flashcard, CustomSet, …) |
| `backend/app/Services/` | Business logic (ExamService, ResultService, AnalyticsService, PassageService, FlashcardService, CustomSetService) |
| `backend/app/Http/Controllers/Api/V1/` | Thin API controllers |
| `backend/app/Http/Controllers/Api/V1/Admin/CustomSetController.php` | Admin CRUD + result detail for custom sets |
| `backend/database/migrations/` | Database schema migrations |
| `backend/database/seeders/` | Sample data (users, questions, passages, JLPT questions, flashcards, exam history) |
| `backend/resources/views/pdf/result.blade.php` | Blade template for PDF export (mPDF) |
| `backend/config/` | Laravel configuration files |

## Deployment — Subpath

The app is deployed under `/miyazaki-shiken-lab` on the production domain.

- `frontend/vite.config.ts` sets `base: '/miyazaki-shiken-lab/'` — rewrites all asset URLs in the build
- `frontend/src/App.tsx` sets `<BrowserRouter basename="/miyazaki-shiken-lab">` — all React Router links and redirects are automatically prefixed
- **Never hardcode** `/miyazaki-shiken-lab` into `<Link to="...">`, `useNavigate(...)`, or `<Navigate to="...">` — the basename handles this transparently
- The only place the full path is built manually is the copy-link feature in custom set pages, which correctly uses `window.location.origin + '/miyazaki-shiken-lab/exam/custom/' + slug`

## JLPT Structure

JLPT categories follow the pattern `JLPT-{level}-{section}`:

| Category | Section | Sub-types (question_type) |
|----------|---------|--------------------------|
| `JLPT-N5-文字語彙` … `JLPT-N1-文字語彙` | げんごちしき（もじ・ごい） | 問題1, 問題2, 問題3, 問題4, 問題5 |
| `JLPT-N5-文法読解` … `JLPT-N1-文法読解` | 言語知識（文法）・読解 | 問題1, 問題2, 問題3, 問題4, 問題5, 問題6 |
| `JLPT-N1-Full`, `JLPT-N2-Full` | Combined paper (N1/N2 only) | All 文字語彙 + 文法読解 sub-types in order |

- `question_type` column on `questions` table drives in-session ordering (CASE WHEN sort in ExamService)
- 文法読解 questions with `passage_id` are grouped by passage in ExamService
- 問題3–6 have associated `passages` records; 問題1–2 do not
- Frontend `ReadingSession` page renders split-screen (passage left, question right) when `passage` is present
- When `passage` is null (vocabulary questions in Full Exam sessions), `ReadingSession` switches to full-width single-column layout

## JLPT Practice Modes (ExamSelect)

`/exam/select?type=jlpt` shows three tabs per level:

| Mode | Category used | Route | Notes |
|------|--------------|-------|-------|
| **本番形式 (Full Exam)** | `JLPT-N1-Full` / `JLPT-N2-Full` (N1/N2); `JLPT-Nx-文字語彙` + `JLPT-Nx-文法読解` (N3/N4/N5) | `/reading/session/…` | Real official time limits |
| **Section Practice** | `JLPT-Nx-文字語彙` or `JLPT-Nx-文法読解` | `/exam/session/…` or `/reading/session/…` | Custom question count (10/20/all) |
| **問題 Drill** | `JLPT-Nx-文字語彙` or `JLPT-Nx-文法読解` with `question_types` filter | As above | Multi-select 問題 chips with per-type counts |

Official time limits used in Full Exam mode:

| Level | 文字語彙 | 文法読解 | Notes |
|-------|---------|---------|-------|
| N1    | —       | —       | Combined 110 min (`JLPT-N1-Full`) |
| N2    | —       | —       | Combined 105 min (`JLPT-N2-Full`) |
| N3    | 30 min  | 70 min  | Separate papers |
| N4    | 25 min  | 55 min  | Separate papers |
| N5    | 20 min  | 40 min  | Separate papers |

## Custom Question Sets

Admin-created named exam sets distributed via shareable links.

- **Models**: `custom_sets`, `custom_set_questions` (pivot), `custom_exam_sessions`, `custom_exam_results`, `custom_answer_records`
- **Service**: `CustomSetService` — `findBySlug`, `startSession`, `submitSession`
- **Admin routes** (require `auth:api` + `admin`):
  - `GET/POST /api/v1/admin/custom-sets` — list / create
  - `GET/PUT/DELETE /api/v1/admin/custom-sets/{id}` — show / update / delete
  - `GET /api/v1/admin/custom-sets/{id}/results` — list submissions
  - `GET /api/v1/admin/custom-sets/{setId}/results/{resultId}` — full per-question detail (admin only)
- **Employee routes** (require `auth:api`):
  - `GET /api/v1/custom-exams/{slug}` — landing page data
  - `POST /api/v1/custom-exams/{slug}/session` — start session
  - `POST /api/v1/custom-exams/sessions/{id}/submit` — submit answers
  - `GET /api/v1/custom-exams/results/{id}` — score summary (no answer records returned)
- **Answer visibility**: `CustomExamController::getResult()` intentionally omits `answer_records` from the employee-facing response — correct answers are never sent over the wire. The admin detail endpoint (`CustomSetController::showResult`) is the only path to full answer data.
- **Copy-link**: `CustomSetList` and `CustomSetEditor` both use `navigator.clipboard` with an `execCommand` fallback

## Anti-Cheat (Exam Security)

Both `ExamSession` and `CustomExamSession` enforce the same security policy:

1. `ExamSecurityNotice` is shown before the exam starts — the user must acknowledge the rules before questions are displayed
2. `useExamSecurity` hook attaches `blur`, `visibilitychange`, and `focus` listeners; each violation increments `violationCount`
3. `ExamViolationModal` appears after each violation showing the count and threshold
4. When `violationCount >= EXAM_SECURITY_THRESHOLD` (3), `onAutoSubmit` is called — the session is submitted immediately
5. `enabled` is gated on `securityAcknowledged && !!session` so the hook only runs during an active, acknowledged session

The only difference between the two pages: `CustomExamSession.onClose` (cancel button in the notice) navigates to `/exam/custom/${slug}` instead of `/exam/select`.

## Post-Login Redirect

- `PrivateRoute` saves the attempted URL in `location.state.from` when redirecting unauthenticated users to `/login`
- `Login.tsx` reads `(location.state as { from?: string })?.from` after successful authentication
- Redirect rules after login:
  - **Employee** with `from`: redirect to `from`
  - **Employee** without `from`: redirect to `/exam/select`
  - **Admin** with `from` starting with `/admin/`: redirect to `from`
  - **Admin** with `from` pointing at an employee route, or no `from`: redirect to `/admin/dashboard`
- Already-logged-in users who land on `/login` follow the same rules

## Seeder Order

```
UserSeeder → ExamSettingSeeder → QuestionSeeder
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

- `ExamSession` and `CustomExamSession` do **not** use `useBlocker` — it is incompatible with `BrowserRouter` (requires a data router)
- Exit is guarded by: local `showExitModal` state + `window.beforeunload` listener + an explicit Exit button
- `handleSubmit` sets `isFinishing.current = true` before calling `resetSession()` to prevent the session-null guard from redirecting away mid-submit

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
- Return `answer_records` from `CustomExamController::getResult()` — employee-facing results must never expose correct answers
- Hardcode `/miyazaki-shiken-lab` in React Router `<Link>`, `useNavigate`, or `<Navigate>` — the `basename` on `BrowserRouter` handles this automatically

## Per-Question Difficulty Tracking

Questions are flagged as "difficult" when their correct-answer rate across all users falls below **30%** (minimum 5 recorded answers required).

- **Service**: `AnalyticsService::getDifficultQuestions(float $threshold = 0.30, int $minAttempts = 5): array`
  - Aggregates `answer_records` grouped by `question_id`; filters with `HAVING` clauses — no separate table needed
  - Returns: `questionId`, `questionText`, `category`, `questionType`, `attemptCount`, `correctRate`
  - Ordered by `correctRate ASC` (hardest first)
- **Route**: `GET /api/v1/admin/analytics/difficult-questions` — admin middleware group only (cross-user aggregate data)
- **Frontend type**: `DifficultyStats` in `frontend/src/types/analytics.ts`
- **Frontend service**: `getDifficultQuestions()` in `analyticsService.ts`
- **UI**: `Reports.tsx` — scrollable table below the category pass rate chart; correct rate color-coded rose `< 15%` / orange `15–30%`

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
