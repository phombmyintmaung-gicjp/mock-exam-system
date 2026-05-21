# Rules — frontend/src/hooks/

- Filename must start with `use` prefix (e.g., `useTimer.ts`) — React hook convention
- Hooks must NOT render JSX — return data and callbacks only
- Hooks that call the API must go through `src/services/`, not call axios directly
- Each hook must expose a consistent shape: `{ data, isLoading, error, ... }`
- Hooks that manage exam session state must read/write via `src/store/`, not local useState
- Do NOT duplicate logic already in a hook — reuse existing hooks inside new ones when possible
- Side effects (fetch on mount, cleanup on unmount) must use `useEffect` with proper dependency arrays and cleanup functions
