# frontend/src/pages/

Page-level components mapped to routes in `App.tsx`.

## Structure

```
pages/
├── admin/    Pages accessible only to Admin role
└── client/   Pages accessible only to Employee role
```

## Role Separation

- `admin/` pages are protected by Admin role guard
- `client/` pages are protected by Employee role guard
- Both require a valid JWT — unauthenticated users are redirected to login

## Routing Convention

Each page file maps 1:1 to a route:

| File | Route |
|------|-------|
| `admin/Dashboard.tsx` | `/admin/dashboard` |
| `admin/Questions.tsx` | `/admin/questions` |
| `client/ExamSelect.tsx` | `/exam/select` |
| `client/ExamSession.tsx` | `/exam/session` |
| `client/Results.tsx` | `/exam/results/:id` |

## Login Page

`Login.tsx` lives directly in `pages/` (not in admin or client) since it is role-agnostic.
