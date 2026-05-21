# frontend/src/

Root of all application source code.

## Top-Level Files

| File | Purpose |
|------|---------|
| `App.tsx` | Root component — defines routes and wraps all providers |
| `main.tsx` | ReactDOM entry point; mounts `<App />` into `index.html` |
| `vite-env.d.ts` | Vite environment type declarations |

## Subdirectory Map

```
src/
├── assets/       Static files imported in JSX (images, icons, fonts)
├── components/   Reusable UI components shared across pages
├── pages/
│   ├── admin/    Admin site pages (dashboard, questions, settings)
│   └── client/   Employee site pages (exam, study, results, profile)
├── hooks/        Custom React hooks (shared logic)
├── services/     API call functions and Axios instance
├── store/        Global state (auth, exam session)
├── types/        TypeScript interfaces and enums
└── i18n/         Translation JSON files (ja.json, en.json)
```

## Data Flow

```
Component → hook (optional) → services/api.ts → Backend REST API
                                      ↑
                           JWT token injected by interceptor
```
