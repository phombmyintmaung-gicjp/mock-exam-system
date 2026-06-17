import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, Navigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { login } from '@/services/authService';
import { useAuthStore } from '@/store/authStore';
import { LanguageToggle } from '@/components/shared/LanguageToggle';
import { ArrowLeftIcon, BookOpenIcon } from '@/components/ui/Icons';

const Login = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { token, user, setAuth } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberEmail, setRememberEmail] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('rememberedEmail');
    if (saved) {
      setEmail(saved);
      setRememberEmail(true);
    }
  }, []);

  if (token && user) {
    return <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/exam/select'} replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { token: newToken, user: newUser } = await login(email, password);
      if (rememberEmail) {
        localStorage.setItem('rememberedEmail', email);
      } else {
        localStorage.removeItem('rememberedEmail');
      }
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
      {/* Back to Home */}
      <Link
        to="/"
        className="absolute top-5 left-5 z-20 flex items-center gap-1.5 rounded-full border border-white/10 bg-white/10 px-3.5 py-1.5 text-sm font-medium text-slate-700 backdrop-blur-sm transition-colors hover:bg-white/20 dark:text-white/70 dark:hover:text-white"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        {t('auth.backToHome')}
      </Link>

      {/* Decorative orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -top-48 -left-48 h-96 w-96 rounded-full bg-amber-400/18 blur-3xl dark:bg-amber-500/15" />
        <div className="absolute top-1/4 -right-32 h-80 w-80 rounded-full bg-orange-400/15 blur-3xl dark:bg-orange-500/12" />
        <div className="absolute -bottom-32 left-1/3 h-64 w-64 rounded-full bg-amber-300/12 blur-3xl dark:bg-amber-600/12" />
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
                <label className="mt-2.5 flex cursor-pointer items-center gap-2 select-none">
                  <input
                    type="checkbox"
                    checked={rememberEmail}
                    onChange={(e) => setRememberEmail(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 accent-amber-500 dark:border-white/20"
                  />
                  <span className="text-xs text-slate-500 dark:text-white/50">{t('auth.rememberEmail')}</span>
                </label>
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
              <Link to="/register" className="font-semibold text-amber-500 hover:text-amber-400 hover:underline transition-colors dark:text-amber-300 dark:hover:text-amber-200">
                {t('auth.signUpLink')}
              </Link>
            </p>

            <div className="mt-4 border-t border-slate-100 pt-4 dark:border-white/10">
              <Link
                to="/study"
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:border-amber-400 hover:text-amber-600 dark:border-white/10 dark:text-white/50 dark:hover:border-amber-400/50 dark:hover:text-amber-400"
              >
                <BookOpenIcon className="h-4 w-4" />
                {t('auth.studyWithoutAccount')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
