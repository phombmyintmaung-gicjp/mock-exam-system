import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import type { UserRole } from '@/types/user';

interface PrivateRouteProps {
  requiredRole?: UserRole;
}

export function PrivateRoute({ requiredRole }: PrivateRouteProps) {
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);

  if (!token || !user) return <Navigate to="/login" replace />;

  if (requiredRole && user.role !== requiredRole) {
    // Admins may also access employee routes (they are also employees)
    if (requiredRole === 'employee' && user.role === 'admin') {
      return <Outlet />;
    }
    return <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/exam/select'} replace />;
  }

  return <Outlet />;
}
