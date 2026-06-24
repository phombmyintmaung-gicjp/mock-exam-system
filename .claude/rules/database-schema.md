# Database Schema

## Role

You are a senior database engineer responsible for schema integrity in a MySQL database backed by Laravel Eloquent ORM. You enforce referential integrity, prevent destructive operations, and ensure analytics queries stay performant through intentional denormalization.

## Context

MySQL database for the Mock Exam System. All Eloquent models are defined under `backend/app/Models/`. Migrations live in `backend/database/migrations/`. The schema covers four concerns: accounts (users), exams (questions, choices, sessions), results (exam results, answer records), and analytics (read-only aggregations — no separate tables).

## Task

When designing or modifying models:
- Place models in `backend/app/Models/`
- Generate migrations with `php artisan make:migration` — one logical change per migration
- Add `SoftDeletes` trait to `Question` model — never hard-delete questions that have `answer_records`
- Pre-compute `is_correct` in `answer_records` at submission time — do not recalculate on read
- Denormalize `user_id` into `exam_results` to avoid joins in analytics queries

When writing analytics queries:
- Aggregate from `exam_results` and `answer_records` on-the-fly using Eloquent query builder — there are no separate analytics tables

## Constraints

- **Never hard-delete** questions that have associated `answer_records` — use `SoftDeletes` trait
- **Never edit migration files manually** — always use `php artisan make:migration`
- **Never run `php artisan migrate:fresh`** without explicit user confirmation — it wipes the database
- `is_correct` in `answer_records` must be pre-computed at submit time — never recalculate per-read
- `user_id` in `exam_results` is intentionally denormalized for analytics performance — keep it in sync
- Each question must have exactly one `choice` with `is_correct = TRUE`
- `exam_sessions.time_limit_seconds = 0` means no time limit (study mode)

## Output Format

### Schema reference

#### Accounts — `backend/app/Models/`

**`users`**
| Column | Type | Notes |
|--------|------|-------|
| `id` | BIGINT PK AUTO_INCREMENT | |
| `email` | VARCHAR(254) UNIQUE | login identifier |
| `name` | VARCHAR(150) | display name |
| `role` | ENUM('admin','employee') | |
| `target_certification` | VARCHAR(200) | nullable |
| `password` | VARCHAR(255) | hashed by Laravel (bcrypt) |
| `is_active` | BOOLEAN | default TRUE |
| `created_at` | TIMESTAMP | timestamps() |
| `updated_at` | TIMESTAMP | timestamps() |

#### Exams — `backend/app/Models/`

**`questions`**
| Column | Type | Notes |
|--------|------|-------|
| `id` | BIGINT PK AUTO_INCREMENT | |
| `text` | TEXT | question body |
| `category` | VARCHAR(100) | certification category (denormalised string) |
| `category_id` | BIGINT FK → categories.id | nullable; set on create/import |
| `question_type` | VARCHAR(30) | JLPT sub-type (問題1–問題6); null for IT |
| `passage_id` | BIGINT FK → passages.id | nullable; JLPT 読解 questions only |
| `explanation` | TEXT | shown after answer |
| `deleted_at` | TIMESTAMP | SoftDeletes — nullable |
| `created_at` | TIMESTAMP | timestamps() |
| `updated_at` | TIMESTAMP | timestamps() |

**`choices`**
| Column | Type | Notes |
|--------|------|-------|
| `id` | BIGINT PK AUTO_INCREMENT | |
| `question_id` | BIGINT FK → questions.id | cascadeOnDelete |
| `text` | VARCHAR(500) | choice body |
| `is_correct` | BOOLEAN | exactly one per question |
| `order` | SMALLINT | display order (0-based) |

**`exam_sessions`**
| Column | Type | Notes |
|--------|------|-------|
| `id` | BIGINT PK AUTO_INCREMENT | |
| `user_id` | BIGINT FK → users.id | |
| `category` | VARCHAR(100) | exam category |
| `time_limit_seconds` | INT | 0 = no limit (study mode) |
| `mode` | ENUM('exam','study') | |
| `completed_at` | TIMESTAMP | nullable; set on submit |
| `is_submitted` | BOOLEAN | default FALSE |
| `created_at` | TIMESTAMP | used as started_at |
| `updated_at` | TIMESTAMP | timestamps() |

#### Results — `backend/app/Models/`

**`exam_results`**
| Column | Type | Notes |
|--------|------|-------|
| `id` | BIGINT PK AUTO_INCREMENT | |
| `session_id` | BIGINT FK → exam_sessions.id | unique (one-to-one) |
| `user_id` | BIGINT FK → users.id | denormalized for fast queries |
| `score` | SMALLINT | correct answer count |
| `total_questions` | SMALLINT | |
| `passing_score` | SMALLINT | threshold at time of exam |
| `status` | ENUM('pass','fail') | |
| `completed_at` | TIMESTAMP | |
| `created_at` | TIMESTAMP | timestamps() |
| `updated_at` | TIMESTAMP | timestamps() |

**`answer_records`**
| Column | Type | Notes |
|--------|------|-------|
| `id` | BIGINT PK AUTO_INCREMENT | |
| `result_id` | BIGINT FK → exam_results.id | cascadeOnDelete |
| `question_id` | BIGINT FK → questions.id | |
| `selected_choice_id` | BIGINT FK → choices.id | nullable (unanswered) |
| `is_correct` | BOOLEAN | pre-computed at submission time |
| `time_taken_seconds` | SMALLINT | nullable |

#### Analytics — no dedicated tables

Aggregated on-the-fly from `exam_results` and `answer_records` using Eloquent:
- **Category stats** — pass/fail counts grouped by category from `exam_results`
- **Weak areas** — accuracy (correct / total) grouped by `questions.category` from `answer_records`
- **Score trend** — `score / total_questions` over time from `exam_results` ordered by `completed_at`

### Entity relationships

```
users ──┐
        │
questions ──── choices   │
    │                    │
    └── exam_sessions ───┘
           │
       exam_results
           │
       answer_records ──── questions
                     └──── choices
```
