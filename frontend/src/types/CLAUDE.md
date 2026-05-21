# frontend/src/types/

TypeScript type definitions shared across the frontend.

## Purpose

Centralizes all interface and enum definitions so they are not duplicated across services, hooks, and components.

## Key Types

| File | Contains |
|------|---------|
| `user.ts` | `User`, `UserRole`, `Department` |
| `exam.ts` | `Exam`, `ExamSession`, `ExamMode`, `Question`, `Choice` |
| `result.ts` | `ExamResult`, `AnswerRecord`, `PassFailStatus` |
| `analytics.ts` | `CategoryStat`, `WeakArea`, `ScoreTrend` |
| `api.ts` | `ApiResponse<T>`, `ApiError`, paginated response wrapper |

## Example Shapes

```ts
type UserRole = 'admin' | 'employee';

interface Question {
  id: number;
  text: string;
  choices: Choice[];
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
}

interface ApiResponse<T> {
  data: T;
}
```
