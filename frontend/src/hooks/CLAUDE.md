# frontend/src/hooks/

Custom React hooks — shared stateful logic extracted from components.

## Purpose

Hooks here are reusable across multiple pages or components. They encapsulate:
- API fetch logic with loading/error state
- Exam session behavior (timer, question navigation, flagging)
- Auth state access
- i18n language switching

## Examples

| Hook | Purpose |
|------|---------|
| `useAuth.ts` | Read current user, role, and token from the auth store |
| `useExamSession.ts` | Manage active exam state (current question, answers, flags) |
| `useTimer.ts` | Countdown timer with auto-submit callback |
| `useQuestions.ts` | Fetch and paginate question list (admin) |
| `useResults.ts` | Fetch exam result by ID |
| `useWeakAreas.ts` | Fetch weak area suggestions for the current user |
| `useLanguage.ts` | Toggle and persist UI language (ja / en) |
