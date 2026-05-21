# Rules — frontend/src/store/

- Store files must NOT import from `src/pages/` or `src/components/`
- Auth store is the single source of truth for the JWT token — no other file stores or caches the token
- Exam session store must be cleared (reset to initial state) when an exam is submitted or abandoned
- Do NOT store sensitive data beyond what is necessary (e.g., do not cache raw question answers in store beyond the active session)
- Store actions must be synchronous — async API calls stay in `src/services/` and `src/hooks/`; only the result is written to the store
- If the token is missing or expired, `authStore` must redirect to the login page — handle this in one place only (the Axios interceptor in `api.ts`)
