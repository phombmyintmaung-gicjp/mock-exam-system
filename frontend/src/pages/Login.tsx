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
    <div className="relative flex min-h-screen bg-app overflow-hidden">
      {/* Decorative orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -top-48 -left-48 h-96 w-96 rounded-full bg-purple-600/20 blur-3xl dark:bg-rose-600/20" />
        <div className="absolute top-1/4 -right-32 h-80 w-80 rounded-full bg-indigo-600/15 blur-3xl dark:bg-amber-500/15" />
        <div className="absolute -bottom-32 left-1/3 h-64 w-64 rounded-full bg-violet-600/15 blur-3xl dark:bg-pink-600/18" />
      </div>

      {/* Left decorative panel — hidden on mobile */}
      <div className="relative hidden flex-1 items-center justify-center overflow-hidden lg:flex">
        <div className="relative z-10 flex flex-col items-center gap-8 px-12 text-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-rose-500 to-rose-600 shadow-2xl shadow-rose-500/40 glow-indigo">
            <span className="text-4xl font-bold text-white">試</span>
          </div>
          <div>
            <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white">{t('app.title')}</h1>
            <p className="mt-3 text-lg text-slate-500 dark:text-white/50">{t('app.subtitle')}</p>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-3 w-full max-w-xs">
            {([
              { value: '4', label: t('home.stats.categories') },
              { value: '2', label: t('home.stats.modes') },
              { value: '100+', label: t('home.stats.questions') },
              { value: '∞', label: t('home.stats.attempts') },
            ]).map(({ value, label }) => (
              <div key={label} className="glass rounded-xl p-4 text-center">
                <div className="text-gradient-brand text-2xl font-extrabold">{value}</div>
                <div className="mt-1 text-xs text-slate-500 dark:text-white/50">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right: login form */}
      <div className="relative flex flex-1 flex-col items-center justify-center px-4 py-12 sm:px-6 lg:max-w-[480px] lg:px-12">
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="mb-8 flex flex-col items-center gap-3 lg:hidden">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 to-rose-600 shadow-lg shadow-rose-500/40">
              <span className="text-2xl font-bold text-white">試</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t('app.title')}</h1>
          </div>

          <div className="flex items-start justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{t('auth.login')}</h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-white/50">{t('app.subtitle')}</p>
            </div>
            <LanguageToggle />
          </div>

          <div className="glass-card rounded-2xl p-8 shadow-2xl shadow-black/15 dark:shadow-black/40">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-slate-700 dark:text-white/80 mb-1.5">
                  {t('auth.email')}
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@example.com"
                  required
                  className="glass-input block w-full rounded-xl px-4 py-2.5 text-sm transition-all"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-slate-700 dark:text-white/80 mb-1.5">
                  {t('auth.password')}
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="glass-input block w-full rounded-xl px-4 py-2.5 text-sm transition-all"
                />
              </div>

              {error && (
                <div className="rounded-xl border border-rose-400/30 bg-rose-500/15 px-4 py-3 text-sm text-rose-300">
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

            <p className="mt-6 text-center text-sm text-slate-400 dark:text-white/40">
              {t('auth.noAccount')}{' '}
              <Link to="/register" className="font-semibold text-indigo-300 hover:text-indigo-200 hover:underline transition-colors">
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
