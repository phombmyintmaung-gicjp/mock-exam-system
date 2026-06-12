import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, Navigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { login } from '@/services/authService';
import { useAuthStore } from '@/store/authStore';
import { LanguageToggle } from '@/components/shared/LanguageToggle';

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
    <div className="flex min-h-screen">

      {/* Left decorative panel — hidden on mobile */}
      <div className="relative hidden flex-1 items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 lg:flex">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: 'radial-gradient(circle, #6366f1 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
          aria-hidden="true"
        />
        <div className="absolute -left-20 top-1/4 h-64 w-64 rounded-full bg-indigo-600/30 blur-3xl" aria-hidden="true" />
        <div className="absolute -right-20 bottom-1/4 h-48 w-48 rounded-full bg-violet-600/30 blur-3xl" aria-hidden="true" />

        <div className="relative z-10 flex flex-col items-center gap-6 px-12 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 to-rose-600 shadow-2xl shadow-rose-500/30">
            <span className="text-3xl font-bold text-white">試</span>
          </div>
          <div>
            <h1 className="text-4xl font-extrabold text-white">{t('app.title')}</h1>
            <p className="mt-3 text-lg text-slate-400">{t('app.subtitle')}</p>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {([
              { value: '4', label: t('home.stats.categories') },
              { value: '2', label: t('home.stats.modes') },
              { value: '100+', label: t('home.stats.questions') },
              { value: '∞', label: t('home.stats.attempts') },
            ]).map(({ value, label }) => (
              <div key={label} className="rounded-xl border border-white/10 bg-white/5 p-4 text-center backdrop-blur-sm">
                <div className="text-gradient-brand text-2xl font-extrabold">{value}</div>
                <div className="mt-1 text-xs text-slate-400">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right: login form */}
      <div className="flex flex-1 flex-col items-center justify-center bg-slate-50 bg-dot-pattern px-4 py-12 sm:px-6 lg:max-w-[480px] lg:px-12">
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="mb-8 flex flex-col items-center gap-3 lg:hidden">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-rose-600 shadow-lg shadow-rose-500/30">
              <span className="text-2xl font-bold text-white">試</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">{t('app.title')}</h1>
          </div>

          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">{t('auth.login')}</h2>
              <p className="mt-1 text-sm text-slate-500">{t('app.subtitle')}</p>
            </div>
            <LanguageToggle />
          </div>

          <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-slate-700">
                  {t('auth.email')}
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@example.com"
                  required
                  className="mt-1.5 block w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-slate-700">
                  {t('auth.password')}
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="mt-1.5 block w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              {error && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
                  {error}
                </div>
              )}

              <Button
                label={loading ? t('auth.loggingIn') : t('auth.login')}
                type="submit"
                disabled={loading}
                className="w-full py-2.5 text-base"
              />
            </form>

            <p className="mt-6 text-center text-sm text-slate-500">
              {t('auth.noAccount')}{' '}
              <Link to="/register" className="font-semibold text-indigo-600 hover:text-indigo-700 hover:underline">
                {t('auth.signUpLink')}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
