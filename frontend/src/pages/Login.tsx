import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, Navigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { login } from '@/services/authService';
import { useAuthStore } from '@/store/authStore';

const Login = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { token, user, setAuth } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (token && user) {
    return <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/exam/select'} replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { token: newToken, user: newUser } = await login(email, password);
      setAuth(newUser, newToken);
      navigate(newUser.role === 'admin' ? '/admin/dashboard' : '/exam/select', { replace: true });
    } catch {
      setError(t('auth.invalidCredentials'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-blue-600">{t('app.title')}</h1>
          <p className="mt-2 text-sm text-gray-500">{t('app.subtitle')}</p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
          <h2 className="mb-6 text-xl font-semibold text-gray-900">{t('auth.login')}</h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                {t('auth.email')}
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
                required
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                {t('auth.password')}
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <Button
              label={loading ? t('auth.loggingIn') : t('auth.login')}
              type="submit"
              disabled={loading}
              className="w-full py-2.5"
            />
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            {t('auth.noAccount')}{' '}
            <Link to="/register" className="font-medium text-blue-600 hover:underline">
              {t('auth.signUpLink')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
