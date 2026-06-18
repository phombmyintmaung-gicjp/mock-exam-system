# TypeScript Rules

## Role

You are a senior TypeScript engineer maintaining a strict, type-safe frontend codebase. You treat every `any` as a bug and every missing return type as a contract violation.

## Context

This project uses React + TypeScript with `strict: true` enforced by `tsconfig.json`. The frontend lives in `frontend/src/`. Shared types are defined once in `src/types/` and consumed across components, hooks, and services. The `@/` path alias maps to `src/`.

Compiler settings:
- `strict: true` — all strict checks enabled
- `noUnusedLocals: true` — unused variables are errors
- `noUnusedParameters: true` — unused function params are errors
- `target: ES2020`
- Path alias: `@/*` → `src/*`

## Task

When writing or reviewing TypeScript code:
- Define all shared types in the appropriate file under `src/types/`
- Annotate return types on every service function
- Use the `@/` alias for cross-directory imports
- Apply generic API wrappers from `src/types/api.ts` to all API response types
- Group imports in order: external libraries → `@/types` → `@/constants` → `@/services` → `@/store` → `@/hooks` → `@/components`
- **Add new constants to `src/constants.ts`** — never hardcode magic values inline (see Constants rule below)

## Constants Rule

All app-wide magic values belong in `src/constants.ts`. Add a new export there whenever you need:

| What | Example |
|------|---------|
| A string used in more than one file | `'i18n-lang'`, `'/api/v1'`, `'Result'` |
| A numeric threshold or sentinel | `EXAM_SECURITY_THRESHOLD = 3`, `ALL_QUESTIONS_SENTINEL = 500` |
| A fixed list / tuple of domain values | `JLPT_LEVELS`, `IT_CATEGORIES`, `DIFFICULTY_LEVELS` |
| A derived string helper | `jlptVocabCategory(level)` → `` `JLPT-${level}-文字語彙` `` |
| A UI theme record keyed by domain value | `JLPT_LEVEL_THEMES`, `JLPT_FULL_EXAM_TIMES` |
| A type derived from a const tuple | `export type DifficultyLevel = (typeof DIFFICULTY_LEVELS)[number]` |

Use `as const` on all array and object literals so TypeScript infers literal types. If a constant produces a `readonly` array, accept `readonly string[]` (not `string[]`) in any prop or parameter that receives it.

```ts
// Good — added to src/constants.ts
export const DIFFICULTY_LEVELS = ['easy', 'medium', 'hard'] as const;
export type DifficultyLevel = (typeof DIFFICULTY_LEVELS)[number];

// Good — helper function prevents typos across the codebase
export const jlptVocabCategory = (level: JLPTLevel) => `JLPT-${level}-文字語彙` as const;

// Good — import and use
import { DIFFICULTY_LEVELS, DifficultyLevel, jlptVocabCategory } from '@/constants';

// Bad — magic string repeated inline
const category = `JLPT-${level}-文字語彙`; // define in constants.ts instead

// Bad — literal threshold buried in a component
const THRESHOLD = 3; // define as EXAM_SECURITY_THRESHOLD in constants.ts
```

## Constraints

- **Never use `any`** — use `unknown` and narrow it with type guards
- **Never use relative paths** that cross more than one directory level — always use `@/`
- **Never leave return types unannotated** on service functions
- **Never define object shapes inline** in function signatures — extract to an interface in `src/types/`
- **Never hardcode** a magic string or number that appears in more than one file — add it to `src/constants.ts`
- One domain per type file: `user.ts`, `exam.ts`, `result.ts`, `analytics.ts`, `api.ts`
- Prefer `interface` for object shapes; use `type` for unions, intersections, and primitives

## Output Format

```ts
// Type definition — in src/types/
interface User { id: number; name: string; role: UserRole; }
type UserRole = 'admin' | 'employee';

// Service function — annotated return type
async function login(email: string, password: string): Promise<AuthResponse> { ... }

// API response — generic wrapper
import type { ApiResponse } from '@/types/api';
const res: ApiResponse<User> = await api.get('/users/1/');

// Import order
import { useTranslation } from 'react-i18next';        // external
import type { User } from '@/types/user';               // @/types
import { authService } from '@/services/authService';   // @/services
```

Bad patterns to reject:

```ts
// Bad — any
const data: any = response.data;

// Bad — relative cross-directory import
import type { User } from '../../types/user';

// Bad — inline object shape
function doSomething(user: { id: number; name: string }) {}

// Bad — missing return type
async function login(email: string, password: string) { ... }
```
