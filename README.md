# Mock Exam System

## Overview

A web-based mock exam platform designed for company employees in Japan.  
Users can practice certification exams such as **AWS**, **Network**, **Security**, and **Linux** in a simulated real-exam environment.

The system supports two modes: a timed **Exam Mode** that mirrors real certification conditions, and a **Study Mode** for learning at your own pace with immediate feedback.

---

## Users

| Role | Description |
|------|-------------|
| Employee (受験者) | Takes mock exams, reviews results, tracks progress |
| Admin (教育委員会メンバー) | Manages questions, exams, settings, and monitors all users. Admins can also take exams as employees. |

---

## Language Support

- UI defaults to **Japanese**, with English toggle available
- Language switching applies to UI elements only (labels, buttons, messages)
- All exam questions and answer choices are in **English**

---

## Features

### Authentication & Authorization
- JWT-based authentication
- Role-based access control (Admin / Employee)
- Session persistence with token refresh

---

### Admin Site

**Dashboard**
- Pass/fail rate by category and department
- Total questions per category
- Per-user drill-down: who passed, who failed, who hasn't attempted yet
- Recent exam activity feed

**Question Management**
- Create / update / delete questions
- Assign category and difficulty level (Easy / Medium / Hard)
- Add explanation per question (shown to users during answer review)
- Bulk import questions from CSV or JSON
- Search and filter by category, difficulty, keyword

**Exam Settings**
- Configured **per exam category** (AWS, Network, Security, Linux)
- Number of questions per exam
- Time limit (minutes; 0 = no limit)
- Passing score threshold (%)

**User Management**
- Create and update employee accounts
- Assign department and target certification

---

### Client Site (Employees)

**User Profile**
- Personal information (name, email, department)
- Target exam / certification goal
- Exam history and score trends

**Exam Mode**
- Select category
- Timed exam with countdown timer
- Multiple-choice questions (4 options)
- Randomized question and answer order
- Progress indicator and question navigation
- Flag / bookmark uncertain questions to revisit before submitting
- Auto-submit when time expires

**Study Mode**
- Untimed practice session
- Immediate feedback after each question (correct / incorrect)
- Explanation shown per question
- No score pressure — focus on learning

**Results & Review**
- Score calculation with pass / fail status
- Correct / incorrect answer breakdown
- Full answer review with explanations
- Export result as PDF

---

### Exam System

- Randomized question order per attempt
- Randomized answer choices per question
- Auto-submit on time expiry
- Persistent exam results across sessions
- Attempt history stored per user

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
| Frontend | React (TypeScript), Tailwind CSS |
| Backend | Laravel 11 (PHP 8.2) |
| Database | MySQL 8.0 |
| Authentication | JWT (`tymon/jwt-auth`) |
| i18n | React i18next (Japanese / English) |

---

## Architecture

```
React Frontend  ──REST API──▶  Laravel 11 Backend  ──▶  MySQL
     │                              │
     │                         ┌────┴────────────────┐
     │                         │  auth      (JWT)     │
     │                         │  exams     (logic)   │
     │                         │  results   (scores)  │
     │                         │  analytics (stats)   │
     └─────────────────────────┘
```

- Frontend communicates with backend exclusively via REST API (`/api/v1/`)
- Backend enforces all business logic and access control
- JWT tokens are issued on login and required for all protected endpoints
- API documentation available at `http://localhost:8000/api/docs/` (Swagger UI)

---

## Project Structure

```
mock-exam-system/
├── frontend/                   # React (TypeScript) + Tailwind CSS
│   ├── public/
│   ├── src/
│   │   ├── assets/             # Images, icons, fonts
│   │   ├── components/         # Reusable UI components
│   │   ├── pages/
│   │   │   ├── admin/          # Admin site pages
│   │   │   └── client/         # Employee site pages
│   │   ├── hooks/              # Custom React hooks
│   │   ├── services/           # API call functions
│   │   ├── store/              # Zustand state (auth, exam session)
│   │   ├── types/              # TypeScript type definitions
│   │   ├── i18n/               # Japanese / English translations
│   │   └── App.tsx
│   ├── package.json
│   └── tsconfig.json
│
├── backend/                    # Laravel 11 (PHP 8.2)
│   ├── app/
│   │   ├── Models/             # Eloquent models
│   │   ├── Http/
│   │   │   ├── Controllers/
│   │   │   │   └── Api/V1/     # Thin API controllers
│   │   │   ├── Requests/       # FormRequest validation
│   │   │   └── Middleware/     # e.g. AdminOnly
│   │   └── Services/           # Business logic
│   ├── database/
│   │   ├── migrations/         # Schema migrations
│   │   └── seeders/            # Sample data seeders
│   ├── routes/
│   │   └── api.php             # All API routes
│   ├── config/
│   │   └── exam.php            # Exam defaults (fallback)
│   └── composer.json
│
└── README.md
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- PHP 8.2+
- Composer 2+
- MySQL 8.0+

### 1. Clone the repository

```bash
git clone <repository-url>
cd mock-exam-system
```

### 2. Configure environment variables

```bash
cd backend
cp .env.example .env
```

Edit `.env` with your database credentials, then generate keys:

```bash
php artisan key:generate
php artisan jwt:secret
```

### 3. Start the backend

```bash
cd backend
composer install
php artisan migrate
php artisan db:seed        # optional: seed sample questions
php artisan serve
```

### 4. Start the frontend

```bash
cd frontend
npm install
npm run dev
```

The app will be available at `http://localhost:5173`  
API documentation: `http://localhost:8000/api/docs/`

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| `APP_KEY` | Laravel application key (generated by `artisan key:generate`) |
| `DB_HOST` | MySQL host |
| `DB_DATABASE` | MySQL database name |
| `DB_USERNAME` | MySQL username |
| `DB_PASSWORD` | MySQL password |
| `JWT_SECRET` | JWT signing secret (generated by `artisan jwt:secret`) |
| `EXAM_PASSING_SCORE` | Default passing score % — fallback if no per-category setting exists (default: `70`) |
| `EXAM_DEFAULT_QUESTION_COUNT` | Default number of questions — fallback (default: `20`) |
| `EXAM_DEFAULT_TIME_LIMIT` | Default time limit in seconds — fallback (default: `3600`) |
