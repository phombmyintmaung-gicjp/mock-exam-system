import { Navigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/store/authStore';
import { LanguageToggle } from '@/components/shared/LanguageToggle';

const CATEGORIES = [
  {
    id: 'AWS',
    descKey: 'home.categories.aws' as const,
    gradient: 'from-orange-500 to-amber-500',
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    iconBg: 'bg-gradient-to-br from-orange-500 to-amber-500',
    textColor: 'text-orange-700',
    icon: (
      <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-3.758-3.848 5.25 5.25 0 00-10.233 2.33A4.502 4.502 0 002.25 15z" />
      </svg>
    ),
  },
  {
    id: 'Network',
    descKey: 'home.categories.network' as const,
    gradient: 'from-blue-500 to-cyan-500',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    iconBg: 'bg-gradient-to-br from-blue-500 to-cyan-500',
    textColor: 'text-blue-700',
    icon: (
      <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
      </svg>
    ),
  },
  {
    id: 'Security',
    descKey: 'home.categories.security' as const,
    gradient: 'from-rose-500 to-pink-500',
    bg: 'bg-rose-50',
    border: 'border-rose-200',
    iconBg: 'bg-gradient-to-br from-rose-500 to-pink-500',
    textColor: 'text-rose-700',
    icon: (
      <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
  },
  {
    id: 'Linux',
    descKey: 'home.categories.linux' as const,
    gradient: 'from-emerald-500 to-green-500',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    iconBg: 'bg-gradient-to-br from-emerald-500 to-green-500',
    textColor: 'text-emerald-700',
    icon: (
      <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 7.5l3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0021 18V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v12a2.25 2.25 0 002.25 2.25z" />
      </svg>
    ),
  },
];

const Home = () => {
  const { t } = useTranslation();
  const { token, user } = useAuthStore();

  if (token && user) {
    return <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/exam/select'} replace />;
  }

  return (
    <div className="min-h-screen bg-white">

      {/* Fixed top navbar */}
      <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-slate-900/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-rose-500 to-rose-600 shadow-md shadow-rose-500/30">
              <span className="text-xs font-bold text-white">試</span>
            </div>
            <span className="text-gradient-brand text-xl font-bold">{t('app.title')}</span>
          </div>
          <div className="flex items-center gap-3">
            <LanguageToggle variant="dark" />
            <Link
              to="/login"
              className="rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:from-indigo-700 hover:to-violet-700 hover:shadow-md"
            >
              {t('auth.login')}
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 px-4 pb-24 pt-32">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: 'radial-gradient(circle, #6366f1 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
          aria-hidden="true"
        />
        <div className="absolute -left-32 top-20 h-64 w-64 rounded-full bg-indigo-600/30 blur-3xl" aria-hidden="true" />
        <div className="absolute -right-20 bottom-10 h-48 w-48 rounded-full bg-violet-600/30 blur-3xl" aria-hidden="true" />

        <div className="relative mx-auto max-w-3xl text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-indigo-400/30 bg-indigo-500/10 px-4 py-1.5 text-xs font-semibold text-indigo-300">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" aria-hidden="true" />
            {t('home.hero.badge')}
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
            {t('home.hero.title')}
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-400">
            {t('home.hero.subtitle')}
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              to="/login"
              className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:from-indigo-700 hover:to-violet-700 hover:shadow-xl sm:w-auto"
            >
              {t('home.hero.cta')}
            </Link>
            <a
              href="#how-it-works"
              className="w-full rounded-xl border border-white/20 bg-white/5 px-8 py-3.5 text-base font-semibold text-white/90 backdrop-blur-sm transition-all hover:bg-white/10 sm:w-auto"
            >
              {t('home.hero.learnMore')}
            </a>
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <section className="border-b border-slate-100 bg-white px-4 py-12">
        <div className="mx-auto grid max-w-4xl grid-cols-2 gap-8 sm:grid-cols-4">
          {(
            [
              { value: '4',    labelKey: 'home.stats.categories' },
              { value: '2',    labelKey: 'home.stats.modes' },
              { value: '100+', labelKey: 'home.stats.questions' },
              { value: '∞',    labelKey: 'home.stats.attempts' },
            ] as const
          ).map(({ value, labelKey }) => (
            <div key={labelKey} className="text-center">
              <div className="text-gradient-brand text-4xl font-extrabold">{value}</div>
              <div className="mt-1 text-sm font-medium text-slate-500">{t(labelKey)}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="bg-slate-50 bg-dot-pattern px-4 py-20">
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-slate-900">{t('home.features.title')}</h2>
            <p className="mt-3 text-slate-500">{t('home.features.subtitle')}</p>
          </div>

          <div className="grid gap-6 sm:grid-cols-3">
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
              <div className="h-1.5 bg-gradient-to-r from-indigo-500 to-violet-500" />
              <div className="p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-md shadow-indigo-500/20">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-slate-900">{t('home.features.exam.title')}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{t('home.features.exam.desc')}</p>
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
              <div className="h-1.5 bg-gradient-to-r from-emerald-500 to-teal-500" />
              <div className="p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-md shadow-emerald-500/20">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-slate-900">{t('home.features.study.title')}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{t('home.features.study.desc')}</p>
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
              <div className="h-1.5 bg-gradient-to-r from-violet-500 to-purple-500" />
              <div className="p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-md shadow-violet-500/20">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-slate-900">{t('home.features.analytics.title')}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{t('home.features.analytics.desc')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Exam categories */}
      <section className="px-4 py-20">
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-slate-900">{t('home.categories.title')}</h2>
            <p className="mt-3 text-slate-500">{t('home.categories.subtitle')}</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {CATEGORIES.map((cat) => (
              <div
                key={cat.id}
                className={`overflow-hidden rounded-2xl border ${cat.border} ${cat.bg} transition-all duration-200 hover:-translate-y-1 hover:shadow-md`}
              >
                <div className={`h-1 bg-gradient-to-r ${cat.gradient}`} />
                <div className="p-5">
                  <div className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl shadow-sm ${cat.iconBg}`}>
                    {cat.icon}
                  </div>
                  <h3 className={`font-bold ${cat.textColor}`}>{cat.id}</h3>
                  <p className="mt-1 text-sm text-slate-600">{t(cat.descKey)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 px-4 py-20">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'radial-gradient(circle, #6366f1 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
          aria-hidden="true"
        />
        <div className="relative mx-auto max-w-4xl">
          <div className="mb-14 text-center">
            <h2 className="text-3xl font-bold text-white">{t('home.howItWorks.title')}</h2>
          </div>

          <div className="relative grid gap-10 sm:grid-cols-3">
            <div className="absolute left-0 right-0 top-6 hidden h-px bg-indigo-600/30 sm:block" aria-hidden="true" />

            {(
              [
                { step: '1', titleKey: 'home.howItWorks.step1.title', descKey: 'home.howItWorks.step1.desc' },
                { step: '2', titleKey: 'home.howItWorks.step2.title', descKey: 'home.howItWorks.step2.desc' },
                { step: '3', titleKey: 'home.howItWorks.step3.title', descKey: 'home.howItWorks.step3.desc' },
              ] as const
            ).map(({ step, titleKey, descKey }) => (
              <div key={step} className="relative text-center">
                <div className="relative z-10 mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-lg font-bold text-white shadow-lg shadow-indigo-500/30">
                  {step}
                </div>
                <h3 className="text-lg font-semibold text-white">{t(titleKey)}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">{t(descKey)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-16">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold text-white">{t('home.cta.title')}</h2>
          <p className="mt-3 text-indigo-100">{t('home.cta.subtitle')}</p>
          <Link
            to="/login"
            className="mt-8 inline-block rounded-xl border-2 border-white/30 bg-white/10 px-8 py-3 text-base font-semibold text-white backdrop-blur-sm transition-all hover:bg-white hover:text-indigo-600"
          >
            {t('home.cta.button')}
          </Link>
          <p className="mt-4 text-sm text-indigo-200">
            {t('home.cta.noAccount')}{' '}
            <Link to="/register" className="font-semibold text-white underline underline-offset-2 hover:text-indigo-100">
              {t('home.cta.signUp')}
            </Link>
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 bg-white px-4 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 sm:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-rose-500 to-rose-600">
              <span className="text-xs font-bold text-white">試</span>
            </div>
            <span className="text-gradient-brand text-sm font-bold">{t('app.title')}</span>
          </div>
          <p className="text-xs text-slate-400">{t('home.footer.copyright')}</p>
        </div>
      </footer>

    </div>
  );
};

export default Home;
