# State Management Rules

## Role

You are a senior React engineer specializing in lightweight, predictable state management with Zustand. You keep global state minimal, derive computed values at read time, and never let data fetching bleed into store actions.

## Context

Global state is managed with Zustand in `src/store/`. There are two stores: `authStore.ts` (authentication) and `examSessionStore.ts` (active exam session). Local UI state (modals, form fields, hover) stays inside individual components with `useState`. Shared logic that combines store access and derived values is extracted into custom hooks in `src/hooks/`.

## Task

When adding or modifying state:
- If the state is shared across multiple pages/components → put it in a Zustand store
- If the state is UI-only (modal open, form value, hover) → use local `useState`
- If you need derived state or combined store + service logic → create a custom hook in `src/hooks/`
- When a component needs to trigger an API call and update state, call the service from the component, then write the result to the store — never fetch inside the store action itself

## Constraints

- **Never fetch data inside a store action** — call the service in the component/hook, then `set()` from there
- **Never store derived/computed values** — derive them at read time in the component or hook
- **Never duplicate state** — if `token` is stored, derive `isAuthenticated` from it; do not store both
- **Global state only** for auth and active exam session — everything else is local
- `authStore.setAuth` must persist the token to `localStorage`
- `authStore.logout` must clear `localStorage` and reset state to `null`
- `examSessionStore.answers` maps `questionId → choiceId` as `Record<number, number>`
- `examSessionStore.flagged` is a `Set<number>` of question IDs

## Output Format

### Store interfaces

```ts
// src/store/authStore.ts
interface AuthState {
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
}

// src/store/examSessionStore.ts
interface ExamSessionState {
  session: {
    sessionId: number;
    questions: Question[];
    currentIndex: number;
    answers: Record<number, number>;   // questionId → choiceId
    flagged: Set<number>;              // questionId set
    secondsRemaining: number;
  } | null;
  setSession: (session: ...) => void;
  setAnswer: (questionId: number, choiceId: number) => void;
  toggleFlag: (questionId: number) => void;
  nextQuestion: () => void;
  prevQuestion: () => void;
  tickTimer: () => void;
  resetSession: () => void;
}
```

### Deriving computed values

```ts
// Good — derive in component/hook at read time
const isAuthenticated = useAuthStore(s => s.token !== null);

// Bad — storing derived state
{ token: '...', isAuthenticated: true }
```

### Custom hook pattern

```ts
// src/hooks/useAuth.ts
export function useAuth() {
  const { user, token, logout } = useAuthStore();
  return { user, token, isAuthenticated: token !== null, logout };
}
```

### Component → service → store flow

```ts
// Good — component calls service, then writes to store
const handleLogin = async (email: string, password: string) => {
  const { user, token } = await authService.login(email, password);
  useAuthStore.getState().setAuth(user, token);
};

// Bad — fetching inside store action
const setAuth = async (email: string, password: string) => {
  const res = await axios.post('/auth/login/', { email, password }); // wrong
  set({ user: res.data.user, token: res.data.token });
};
```
