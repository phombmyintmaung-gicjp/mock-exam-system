import { useTranslation } from 'react-i18next';
import { Navigate, Link } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { isAdminRole } from '@/types/user';
import { LanguageToggle } from '@/components/shared/LanguageToggle';
import { ArrowLeftIcon, BookOpenIcon } from '@/components/ui/Icons';

// One-Login migration, Phase 3 (2026-09): local email/password login is retired entirely.
// Authentication now happens once at the Main Staff Portal; this app only ever rides the
// shared jwt_token cookie it sets (see App.tsx's fetchMe()-on-mount check). This page is a
// plain redirect, not a form submit.
const Login = () => {
  const { t } = useTranslation();
  const { token, user } = useAuthStore();

  if (token && user) {
    const defaultPath = isAdminRole(user.role) ? '/admin/dashboard' : '/exam/select';
    return <Navigate to={defaultPath} replace />;
  }

  const goToMainLogin = () => {
    window.location.href = '/miyazaki-staff-portal/login';
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
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{t('auth.ssoTitle')}</h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-white/50">{t('auth.ssoSubtitle')}</p>
            </div>
            <LanguageToggle />
          </div>

          <div className="glass-card rounded-2xl p-8 shadow-2xl shadow-black/15 dark:shadow-black/40">
            <button
              type="button"
              onClick={goToMainLogin}
              className="w-full rounded-xl bg-gradient-to-br from-rose-500 to-rose-600 py-2.5 text-base font-semibold text-white shadow-lg shadow-rose-500/30 transition-transform hover:scale-[1.01]"
            >
              {t('auth.ssoButton')}
            </button>

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
