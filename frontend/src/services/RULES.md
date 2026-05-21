# Rules — frontend/src/services/

- `api.ts` is the ONLY place where the Axios instance is created — never create a second one
- All service functions must use the shared `api` instance from `api.ts`, never raw `fetch` or a new `axios`
- Service functions must be plain `async` functions — no React hooks inside services
- Each function must return typed data (use types from `src/types/`) — no `any` return types
- Error handling: let errors propagate to the caller (hook or component) — do NOT swallow errors silently
- Token attachment is handled by the interceptor in `api.ts` — do NOT manually set headers in service functions
- Service files must be grouped by domain (auth, exam, result, etc.) — do NOT put all calls in one file
