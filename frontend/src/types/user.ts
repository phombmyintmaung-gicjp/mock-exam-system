// One-Login migration (2026-09): users come directly from Main's shared `users` table. RBAC
// (Main feature 30): admin-ness is the server-computed `is_admin` (Main's Administrator access
// group), never the legacy users.role value — the backend no longer serializes `role` at all.
export interface User {
  id: number;
  name: string;
  email: string;
  is_admin: boolean;
  created_at?: string;
}

/** True when the backend reports the user as an Administrator (UI routing/menus only — the API enforces it). */
export function isAdminUser(user: Pick<User, 'is_admin'> | null | undefined): boolean {
  return !!user?.is_admin;
}
