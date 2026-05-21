# Rules — frontend/src/pages/admin/

- All pages must verify `user.role === 'admin'` via the auth store — rely on `<AdminRoute>` guard
- Question form must validate: at least one correct answer marked, all 4 choices filled, category selected
- Bulk import page must show a preview of parsed rows before submitting to the API
- Destructive actions (delete question, remove user) must show a confirmation dialog before calling the API
- Dashboard charts and stats are read-only — no mutations from the dashboard page
- Export actions (CSV) call the backend endpoint; do NOT generate files client-side
- All table lists must support pagination — never fetch all records in one request
