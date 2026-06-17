import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, Navigate, Link } from 'react-router-dom';
import clsx from 'clsx';
import { Button } from '@/components/ui/Button';
import { register } from '@/services/authService';
import { useAuthStore } from '@/store/authStore';
import { LanguageToggle } from '@/components/shared/LanguageToggle';
import { ArrowLeftIcon } from '@/components/ui/Icons';

const ALLOWED_DOMAIN = '@gicjp.com';

const Register = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { token, user, setAuth } = useAuthStore();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  if (token && user) {
    return <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/exam/select'} replace />;
  }

  const validate = (): boolean => {
    const errors: Record<string, string> = {};
    if (!name.trim()) errors.name = t('auth.nameRequired');
    if (!email.toLowerCase().endsWith(ALLOWED_DOMAIN)) errors.email = t('auth.emailDomainError');
    if (password.length < 8) errors.password = t('auth.passwordTooShort');
    if (password !== confirmPassword) errors.confirmPassword = t('auth.passwordMismatch');
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError('');
    if (!validate()) return;
    setLoading(true);
    try {
      const { token: newToken, user: newUser } = await register(name, email, password, confirmPassword);
      setAuth(newUser, newToken);
      navigate('/exam/select', { replace: true });
    } catch {
      setServerError(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const benefits = [
    { color: 'bg-rose-500', label: t('auth.registerPage.benefit1'), desc: 'AWS · Network · Security · Linux' },
    { color: 'bg-amber-500', label: t('auth.registerPage.benefit2'), desc: 'N1 · N2 · N3 · N4 · N5' },
    { color: 'bg-emerald-500', label: t('auth.registerPage.benefit3'), desc: t('auth.registerPage.benefit3Desc') },
  ];

  return (
    <div className="relative flex min-h-screen bg-app overflow-hidden">
      {/* Back to Login */}
      <Link
        to="/login"
        className="absolute top-5 left-5 z-20 flex items-center gap-1.5 rounded-full border border-white/10 bg-white/10 px-3.5 py-1.5 text-sm font-medium text-slate-700 backdrop-blur-sm transition-colors hover:bg-white/20 dark:text-white/70 dark:hover:text-white"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        {t('auth.backToLogin')}
      </Link>

      {/* Decorative orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -top-48 -right-48 h-96 w-96 rounded-full bg-emerald-400/15 blur-3xl dark:bg-emerald-500/12" />
        <div className="absolute top-1/3 -left-32 h-80 w-80 rounded-full bg-amber-400/15 blur-3xl dark:bg-amber-500/10" />
        <div className="absolute -bottom-32 right-1/3 h-64 w-64 rounded-full bg-teal-300/12 blur-3xl dark:bg-teal-600/10" />
      </div>

      {/* Left decorative panel — desktop only */}
      <div className="relative hidden flex-1 items-center justify-center overflow-hidden lg:flex">
        <div className="relative z-10 flex flex-col items-center gap-8 px-12 text-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-2xl shadow-emerald-500/40">
            <span className="text-4xl font-bold text-white">登</span>
          </div>
          <div>
            <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white">
              {t('auth.registerPage.heroTitle')}
            </h1>
            <p className="mt-3 max-w-xs text-lg text-slate-500 dark:text-white/50">
              {t('auth.registerPage.heroSubtitle')}
            </p>
          </div>
          <div className="mt-2 flex w-full max-w-xs flex-col gap-3">
            {benefits.map((b) => (
              <div key={b.label} className="glass flex items-center gap-3 rounded-xl p-4 text-left">
                <div className={clsx('h-2.5 w-2.5 shrink-0 rounded-full', b.color)} />
                <div>
                  <p className="text-sm font-semibold text-slate-800 dark:text-white/90">{b.label}</p>
                  <p className="text-xs text-slate-400 dark:text-white/40">{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right: register form */}
      <div className="relative flex flex-1 flex-col items-center justify-center px-4 py-12 sm:px-6 lg:max-w-[480px] lg:px-12">
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="mb-8 flex flex-col items-center gap-3 lg:hidden">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/40">
              <span className="text-2xl font-bold text-white">登</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t('app.title')}</h1>
          </div>

          <div className="mb-8 flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{t('auth.register')}</h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-white/50">{t('auth.registerPage.subtitle')}</p>
            </div>
            <LanguageToggle />
          </div>

          <div className="glass-card rounded-2xl p-8 shadow-2xl shadow-black/15 dark:shadow-black/40">
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>

              {/* Name */}
              <div>
                <label htmlFor="name" className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-white/80">
                  {t('auth.name')}
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => { setName(e.target.value); setFieldErrors((p) => ({ ...p, name: '' })); }}
                  placeholder={t('auth.namePlaceholder')}
                  required
                  className={clsx('glass-input block w-full rounded-xl px-4 py-2.5 text-sm transition-all', fieldErrors.name && 'ring-1 ring-rose-400')}
                />
                {fieldErrors.name && <p className="mt-1 text-xs text-rose-500 dark:text-rose-400">{fieldErrors.name}</p>}
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-white/80">
                  {t('auth.email')}
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setFieldErrors((p) => ({ ...p, email: '' })); }}
                  placeholder={`yourname${ALLOWED_DOMAIN}`}
                  required
                  className={clsx('glass-input block w-full rounded-xl px-4 py-2.5 text-sm transition-all', fieldErrors.email && 'ring-1 ring-rose-400')}
                />
                {fieldErrors.email
                  ? <p className="mt-1 text-xs text-rose-500 dark:text-rose-400">{fieldErrors.email}</p>
                  : <p className="mt-1 text-xs text-slate-400 dark:text-white/30">{ALLOWED_DOMAIN} only</p>
                }
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-white/80">
                  {t('auth.password')}
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setFieldErrors((p) => ({ ...p, password: '' })); }}
                  placeholder="••••••••"
                  required
                  className={clsx('glass-input block w-full rounded-xl px-4 py-2.5 text-sm transition-all', fieldErrors.password && 'ring-1 ring-rose-400')}
                />
                {fieldErrors.password
                  ? <p className="mt-1 text-xs text-rose-500 dark:text-rose-400">{fieldErrors.password}</p>
                  : <p className="mt-1 text-xs text-slate-400 dark:text-white/30">{t('auth.passwordHint')}</p>
                }
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirmPassword" className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-white/80">
                  {t('auth.confirmPassword')}
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); setFieldErrors((p) => ({ ...p, confirmPassword: '' })); }}
                  placeholder="••••••••"
                  required
                  className={clsx('glass-input block w-full rounded-xl px-4 py-2.5 text-sm transition-all', fieldErrors.confirmPassword && 'ring-1 ring-rose-400')}
                />
                {fieldErrors.confirmPassword && (
                  <p className="mt-1 text-xs text-rose-500 dark:text-rose-400">{fieldErrors.confirmPassword}</p>
                )}
              </div>

              {serverError && (
                <div className="rounded-xl border border-rose-400/30 bg-rose-500/15 px-4 py-3 text-sm text-rose-300">
                  {serverError}
                </div>
              )}

              <Button
                label={loading ? t('auth.registering') : t('auth.registerButton')}
                type="submit"
                disabled={loading}
                className="w-full py-2.5 text-base"
              />
            </form>

            <p className="mt-6 text-center text-sm text-slate-400 dark:text-white/40">
              {t('auth.alreadyHaveAccount')}{' '}
              <Link
                to="/login"
                className="font-semibold text-amber-500 transition-colors hover:text-amber-400 hover:underline dark:text-amber-300 dark:hover:text-amber-200"
              >
                {t('auth.login')}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
