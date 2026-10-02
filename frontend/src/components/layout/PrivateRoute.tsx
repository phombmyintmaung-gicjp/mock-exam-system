import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { isAdminUser } from '@/types/user';

interface PrivateRouteProps {
  // One-Login migration (2026-09): semantic role names, not raw numbers — Main's own role
  // scheme (NULL/1 = Admin, 3 = Member) replaced this app's old local 1/2 numbering, and a
  // raw number here would silently stop matching once role can be NULL. 'admin' gates the
  // admin section outright; 'member' gates the student section, but an admin may also
  // access it (they are also, functionally, a member).
  requiredRole?: 'admin' | 'member';
}

export function PrivateRoute({ requiredRole }: PrivateRouteProps) {
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const location = useLocation();

  if (!token || !user) {
    return <Navigate to="/login" state={{ from: location.pathname + location.search }} replace />;
  }

  const isAdmin = isAdminUser(user);

  if (requiredRole === 'admin' && !isAdmin) {
    return <Navigate to="/exam/select" replace />;
  }

  // requiredRole === 'member': any authenticated user may access it, admins included —
  // no redirect needed either way.

  return <Outlet />;
}
