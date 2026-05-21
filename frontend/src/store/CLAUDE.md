# frontend/src/store/

Global state management for the application.

## Purpose

Stores state that must persist across page navigations or be shared between unrelated components.

## Stores

| File | State |
|------|-------|
| `authStore.ts` | Current user, JWT token, role, login/logout actions |
| `examSessionStore.ts` | Active exam: current question index, answers map, flagged questions, time remaining |

## What Goes Here

- Auth state (user info, token, role)
- Active exam session (must survive question navigation without re-fetching)
- UI preferences that persist (language choice if not handled by i18n directly)

## What Does NOT Go Here

- Server data that can be re-fetched (question lists, results) — use hooks with local state
- Page-specific UI state (modal open/close, form values) — use `useState` in the component

## Technology

Use a lightweight store solution (e.g., Zustand or React Context + useReducer). Keep stores simple.
