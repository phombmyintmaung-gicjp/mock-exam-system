# frontend/src/pages/admin/

Pages for the Admin role only. Accessible via `/admin/*` routes.

## Pages

| File | Route | Purpose |
|------|-------|---------|
| `Dashboard.tsx` | `/admin/dashboard` | Pass/fail stats, recent activity, per-user drill-down |
| `Questions.tsx` | `/admin/questions` | List, search, filter questions |
| `QuestionForm.tsx` | `/admin/questions/new`, `/admin/questions/:id/edit` | Create / edit a question |
| `QuestionImport.tsx` | `/admin/questions/import` | Bulk CSV / Excel import |
| `ExamSettings.tsx` | `/admin/exams` | Configure time limit, question count, passing score |
| `UserManagement.tsx` | `/admin/users` | View users, assign exams, set deadlines |
| `Reports.tsx` | `/admin/reports` | Pass rate by category; difficult questions table (< 30% correct rate) |

## Access Control

All pages here are wrapped in an `<AdminRoute>` guard component.
Employees who attempt to access `/admin/*` are redirected to `/exam/select`.

## Key Data

- Pass/fail rates shown per category
- Difficult questions flagged when correct rate < 30% across all users (min 5 attempts)
- Each question has: text, 4 choices, correct answer, difficulty, category, explanation
