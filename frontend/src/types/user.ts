// One-Login migration (2026-09): `role` now comes directly from Main's shared `users` row
// (mockexam_users no longer exists — "ALL USERS come from [Main's] USERS TABLE"). Main's own
// convention is NULL/1 = Admin, 3 = Member — see CLAUDE.md's User model — a different value
// space than this app's old local 1=admin/2=employee scheme. Always check admin-ness via
// isAdminRole() below, never a raw `role === 1` comparison, since a NULL role is also Admin.
export type UserRole = 1 | 3 | null;

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  created_at?: string;
}

/** True for Main's Admin convention (role is NULL or 1) — never compare role directly. */
export function isAdminRole(role: UserRole | number | null): boolean {
  return role === 1 || role === null;
}
