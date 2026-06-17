# Mock Exam System

## Overview

A web-based mock exam platform designed for company employees in Japan.  
Users can practice certification exams (**AWS**, **Network**, **Security**, **Linux**) and **JLPT** (Japanese Language Proficiency Test N1–N5) in a simulated real-exam environment.

The system supports two modes: a timed **Exam Mode** that mirrors real certification conditions, and a **Study Mode** for learning at your own pace with immediate inline feedback per question.

A **free Flashcard Study** section (`/study`) is publicly accessible — no login required — covering kanji readings, JLPT vocabulary, and grammar patterns across all five JLPT levels.

---

## Users

| Role | Description |
|------|-------------|
| Employee (受験者) | Takes mock exams, reviews results, tracks progress |
| Admin (教育委員会メンバー) | Manages questions, passages, exam settings, and monitors all users |

---

## Language Support

- UI defaults to **Japanese**, with English toggle available
- Language preference is **persisted across page loads** via `localStorage` (`i18n-lang` key)
- Language switching applies to UI elements only (labels, buttons, messages)
- All exam questions and answer choices are in **Japanese** (JLPT) or **English** (IT certifications)

---

## Features

### Authentication & Authorization
- JWT-based authentication (email domain restricted to `@gicjp.com`)
- Self-registration for new employees (`/register`)
- Role-based access control (Admin / Employee)
- Session persistence with token refresh
- Public flashcard study at `/study` — no account needed

---

### Admin Site

**Dashboard**
- Pass/fail rate by category and department
- Total questions per category
- Per-user drill-down: who passed, who failed, who hasn't attempted yet
- Recent exam activity feed

**Question Management**
- Create / update / soft-delete questions
- Assign category and difficulty level (Easy / Medium / Hard)
- Assign `question_type` sub-label for JLPT ordering (問題1–5 / もんだい１–６)
- Add explanation per question (shown during answer review)
- Bulk import questions from EXCEL or JSON
- Search and filter by category, difficulty, keyword

**Passage Management**
- Create / update / delete reading passages used by JLPT 文法読解 questions
- Assign JLPT level (N1–N5)
- Passages with Ⓐ/Ⓑ blanks (もんだい３), short readings (もんだい４/５), and notices (もんだい６)

**Exam Settings**
- Configured **per exam category**
- Number of questions per exam, time limit (0 = no limit), passing score threshold (%)

**User Management**
- Create and update employee accounts
- Assign department and target certification

**Flashcard Management**
- Create / update / delete flashcards (kanji, vocabulary, grammar)
- Assign JLPT level (N1–N5) and type per card
- Fields: front (kanji/word/pattern), reading (hiragana), meaning (English), example sentence
- **Furigana notation** in example sentences: wrap kanji with `{漢字|よみ}` — rendered as ruby text on the study card
- **Live preview** panel in the create/edit form — shows both card faces with furigana rendered in real time
- **Bulk import** from Excel (.xlsx / .xls) with column reference, furigana guide, and downloadable template

---

### Client Site (Employees)

**JLPT Practice** (`/exam/select`)
- Level selector: N1 / N2 / N3 / N4 / N5
- Two sections per level:
  - **言語知識（文字・語彙）** — 問題1 (kanji reading), 問題2 (kanji writing), 問題3 (fill-in vocab), 問題4 (paraphrase), 問題5 (usage)
  - **言語知識（文法）・読解** — もんだい１ (grammar fill-in), もんだい２ (★ sentence ordering), もんだい３ (Ⓐ/Ⓑ passage), もんだい４ (short reading), もんだい５ (medium reading), もんだい６ (information retrieval / notices)
- Questions display in official JLPT sub-type order
- 読解 section uses a split-screen layout: passage panel on the left, question on the right

**IT Certification Practice** (separate category selection)
- Categories: AWS, Network, Security, Linux
- Difficulty-balanced question selection (Easy / Medium / Hard)

**Exam Mode**
- Timed exam with countdown timer
- Multiple-choice questions (4 options)
- Progress indicator and question navigation
- Flag / bookmark uncertain questions to revisit before submitting
- Explicit exit button with confirmation modal (guards against accidental exit)
- Auto-submit when time expires

**Study Mode**
- Untimed practice session
- Immediate inline feedback after answering each question:
  - Correct choice highlighted in green with ✓ badge
  - Wrong selection highlighted in red with ✗ badge
  - Unchosen options dimmed
- Explanation displayed below choices after answering
- After completing all questions, navigates to the **Results page** (score displayed)

**Results & Review**
- Score calculation with pass / fail status
- Score percentage vs passing threshold
- Full answer review with explanations (back button returns to result summary)
- Export result as **PDF** — filename format: `Result_ExamName_UserName.pdf`
  - PDF includes candidate info, score box, full answer review with highlighted correct/wrong choices, and explanations
  - Japanese characters rendered correctly via IPAex Gothic font

**User Profile**
- Personal information (name, email, department)
- Target exam / certification goal
- Exam history and score trends
- Weak area analysis

**Free Flashcard Study** (`/study` — no login required)
- Kanji readings, JLPT vocabulary, and grammar patterns
- Filter by JLPT level (N1–N5) and card type
- Flip card animation — front shows the word, back shows reading + meaning + example sentence
- Example sentences display **furigana** (ruby text) above kanji, authored with `{漢字|よみ}` notation
- Shuffle mode for randomised practice

---

### Analytics & Insights

- Score history and trend over time
- Pass/fail statistics by category and department
- Performance analysis by category (identifies weak areas)
- Weak area practice suggestions based on past wrong answers
- Admin-level reporting exportable as CSV

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React (TypeScript), Tailwind CSS, Zustand, react-i18next |
| Backend | Laravel 11 (PHP 8.2) |
| Database | MySQL 8.0 |
| Authentication | JWT (`tymon/jwt-auth`) |
| PDF Generation | mPDF 8.x with IPAex Gothic TTF (Japanese support) |
| Containerization | Docker / Docker Compose |
| i18n | react-i18next (Japanese default / English toggle) |

---

## Architecture

```
React Frontend  ──REST API──▶  Laravel 11 Backend  ──▶  MySQL
     │                              │
     │                         ┌────┴────────────────────┐
     │                         │  auth        (JWT)       │
     │                         │  exams       (logic)     │
     │                         │  passages    (JLPT)      │
     │                         │  results     (scores)    │
     │                         │  analytics   (stats)     │
     │                         │  pdf         (mPDF)      │
     └─────────────────────────┘
```

- Frontend communicates with backend exclusively via REST API (`/api/v1/`)
- Backend enforces all business logic and access control
- JWT tokens are issued on login and required for all protected endpoints
- API documentation: `http://localhost:8000/api/docs/` (Swagger UI)

---

## Database Schema (Key Tables)

| Table | Purpose |
|-------|---------|
| `users` | Employee and admin accounts |
| `departments` | Organisational units |
| `questions` | Exam questions with `question_type` for JLPT sub-types |
| `choices` | Answer choices (exactly one `is_correct` per question) |
| `passages` | JLPT reading passages (level, title, content) |
| `exam_sessions` | One record per attempt (mode, category, time limit) |
| `exam_results` | Score, status (pass/fail), denormalised `user_id` |
| `answer_records` | Per-question answer with pre-computed `is_correct` |
| `exam_settings` | Per-category question count, time limit, passing score |
| `flashcards` | Kanji / vocabulary / grammar cards with reading, meaning, example |

---

## Project Structure

```
mock-exam-system/
├── frontend/                   # React (TypeScript) + Tailwind CSS
│   ├── src/
│   │   ├── components/         # ui/, layout/, shared/ (incl. Furigana, FlipCard)
│   │   ├── pages/
│   │   │   ├── admin/          # Dashboard, Questions, Passages,
│   │   │   │                   #   Flashcards, FlashcardImport, Users, Settings
│   │   │   ├── client/         # ExamSelect, ExamSession, StudySession,
│   │   │   │                   #   ReadingSession, Results, Review, History,
│   │   │   │                   #   Profile, WeakAreas
│   │   │   ├── study/          # StudyHome, FlashcardSession (public — no login)
│   │   │   └── NotFound.tsx    # 404 page (bilingual, auth-aware back button)
│   │   ├── hooks/              # Custom React hooks
│   │   ├── services/           # API call functions (examService, authService,
│   │   │                       #   flashcardService, publicApi, …)
│   │   ├── store/              # Zustand: authStore, examSessionStore
│   │   ├── types/              # TypeScript interfaces (exam, user, result, flashcard, …)
│   │   └── i18n/               # ja.json, en.json (language persisted in localStorage)
│   ├── Dockerfile
│   └── package.json
│
├── backend/                    # Laravel 11 (PHP 8.2)
│   ├── app/
│   │   ├── Models/             # User, Question, Passage, ExamSession, Flashcard, …
│   │   ├── Http/
│   │   │   ├── Controllers/Api/V1/  # Thin controllers
│   │   │   ├── Requests/            # FormRequest validation
│   │   │   └── Middleware/          # AdminOnly
│   │   └── Services/           # ExamService, ResultService, AnalyticsService,
│   │                           #   PassageService, FlashcardService
│   ├── database/
│   │   ├── migrations/         # Schema migrations
│   │   └── seeders/            # DepartmentSeeder, UserSeeder,
│   │                           #   ExamSettingSeeder, QuestionSeeder,
│   │                           #   PassageSeeder, JLPTQuestionSeeder,
│   │                           #   FlashcardSeeder, ExamHistorySeeder
│   ├── resources/views/pdf/    # Blade PDF templates (result.blade.php)
│   ├── Dockerfile
│   └── routes/api.php
│
├── docker-compose.yml
└── README.md
```

---

## Getting Started (Docker — recommended)

```bash
docker compose up --build
```

Seeds are run automatically on first start. Default accounts:

| Email | Password | Role |
|-------|----------|------|
| `admin@gicjp.com` | `password` | Admin |
| `moepyaesonewai@gicjp.com` | `password` | Employee |

App: `http://localhost:5173`  
API docs: `http://localhost:8000/api/docs/`

---

## Getting Started (Local)

### Prerequisites
- Node.js 18+, PHP 8.2+, Composer 2+, MySQL 8.0+
- For PDF export (Japanese): `fonts-ipaexfont-gothic` system package (provides `/usr/share/fonts/opentype/ipaexfont-gothic/ipaexg.ttf`)

### Backend

```bash
cd backend
composer install
cp .env.example .env   # fill in DB credentials
php artisan key:generate
php artisan jwt:secret
php artisan migrate
php artisan db:seed
php artisan serve
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| `APP_KEY` | Laravel application key (`artisan key:generate`) |
| `DB_HOST` | MySQL host |
| `DB_DATABASE` | MySQL database name |
| `DB_USERNAME` | MySQL username |
| `DB_PASSWORD` | MySQL password |
| `JWT_SECRET` | JWT signing secret (`artisan jwt:secret`) |
| `EXAM_PASSING_SCORE` | Default passing score % fallback (default: `70`) |
| `EXAM_DEFAULT_QUESTION_COUNT` | Default question count fallback (default: `20`) |
| `EXAM_DEFAULT_TIME_LIMIT` | Default time limit in seconds fallback (default: `3600`) |
