import { useAuthStore } from '@/store/authStore';

const useAuth = () => {
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const logout = useAuthStore((s) => s.logout);

  return { user, token, isAuthenticated: !!token, logout };
};

export default useAuth;
