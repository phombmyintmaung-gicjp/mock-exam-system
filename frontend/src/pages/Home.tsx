import { Navigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/store/authStore';
import { LanguageToggle } from '@/components/shared/LanguageToggle';

/* ------------------------------------------------------------------ */
/* Static category config — matches ExamSelect.tsx colour scheme       */
/* ------------------------------------------------------------------ */
const CATEGORIES = [
  {
    id: 'AWS',
    descKey: 'home.categories.aws' as const,
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    iconBg: 'bg-orange-100',
    iconColor: 'text-orange-600',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-3.758-3.848 5.25 5.25 0 00-10.233 2.33A4.502 4.502 0 002.25 15z" />
      </svg>
    ),
  },
  {
    id: 'Network',
    descKey: 'home.categories.network' as const,
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
      </svg>
    ),
  },
  {
    id: 'Security',
    descKey: 'home.categories.security' as const,
    bg: 'bg-red-50',
    border: 'border-red-200',
    iconBg: 'bg-red-100',
    iconColor: 'text-red-600',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
  },
  {
    id: 'Linux',
    descKey: 'home.categories.linux' as const,
    bg: 'bg-green-50',
    border: 'border-green-200',
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 7.5l3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0021 18V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v12a2.25 2.25 0 002.25 2.25z" />
      </svg>
    ),
  },
];

/* ------------------------------------------------------------------ */
/* Page                                                                 */
/* ------------------------------------------------------------------ */
const Home = () => {
  const { t } = useTranslation();
  const { token, user } = useAuthStore();

  if (token && user) {
    return <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/exam/select'} replace />;
  }

  return (
    <div className="min-h-screen bg-white">

      {/* ── Fixed top navbar ─────────────────────────────────────── */}
      <header className="fixed inset-x-0 top-0 z-50 border-b border-gray-100 bg-white/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <span className="text-xl font-bold text-blue-600">{t('app.title')}</span>
          <div className="flex items-center gap-3">
            <LanguageToggle />
            <Link
              to="/login"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
            >
              {t('auth.login')}
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-b from-blue-50 to-white px-4 pb-20 pt-32">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-5 inline-flex items-center rounded-full border border-blue-100 bg-blue-50 px-4 py-1.5 text-xs font-semibold text-blue-600">
            {t('home.hero.badge')}
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
            {t('home.hero.title')}
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-gray-600">
            {t('home.hero.subtitle')}
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              to="/login"
              className="w-full rounded-lg bg-blue-600 px-7 py-3 text-base font-semibold text-white transition-colors hover:bg-blue-700 sm:w-auto"
            >
              {t('home.hero.cta')}
            </Link>
            <a
              href="#how-it-works"
              className="w-full rounded-lg border border-gray-300 bg-white px-7 py-3 text-base font-semibold text-gray-700 transition-colors hover:bg-gray-50 sm:w-auto"
            >
              {t('home.hero.learnMore')}
            </a>
          </div>
        </div>
      </section>

      {/* ── Stats strip ──────────────────────────────────────────── */}
      <section className="border-y border-gray-100 bg-white px-4 py-10">
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
              <div className="text-3xl font-extrabold text-blue-600">{value}</div>
              <div className="mt-1 text-sm text-gray-500">{t(labelKey)}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────── */}
      <section className="px-4 py-20">
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-gray-900">{t('home.features.title')}</h2>
            <p className="mt-3 text-gray-500">{t('home.features.subtitle')}</p>
          </div>

          <div className="grid gap-6 sm:grid-cols-3">
            {/* Exam Mode */}
            <div className="rounded-xl border border-blue-100 bg-blue-50 p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">{t('home.features.exam.title')}</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">{t('home.features.exam.desc')}</p>
            </div>

            {/* Study Mode */}
            <div className="rounded-xl border border-green-100 bg-green-50 p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-green-600">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">{t('home.features.study.title')}</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">{t('home.features.study.desc')}</p>
            </div>

            {/* Analytics */}
            <div className="rounded-xl border border-purple-100 bg-purple-50 p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-purple-600">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">{t('home.features.analytics.title')}</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">{t('home.features.analytics.desc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Exam categories ──────────────────────────────────────── */}
      <section className="bg-gray-50 px-4 py-20">
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-gray-900">{t('home.categories.title')}</h2>
            <p className="mt-3 text-gray-500">{t('home.categories.subtitle')}</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {CATEGORIES.map((cat) => (
              <div key={cat.id} className={`rounded-xl border p-5 ${cat.bg} ${cat.border}`}>
                <div className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg ${cat.iconBg} ${cat.iconColor}`}>
                  {cat.icon}
                </div>
                <h3 className="font-semibold text-gray-900">{cat.id}</h3>
                <p className="mt-1 text-sm text-gray-600">{t(cat.descKey)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────── */}
      <section id="how-it-works" className="px-4 py-20">
        <div className="mx-auto max-w-4xl">
          <div className="mb-14 text-center">
            <h2 className="text-3xl font-bold text-gray-900">{t('home.howItWorks.title')}</h2>
          </div>

          <div className="relative grid gap-10 sm:grid-cols-3">
            {/* Connector line on desktop */}
            <div className="absolute left-0 right-0 top-6 hidden h-px bg-blue-100 sm:block" aria-hidden="true" />

            {(
              [
                { step: '1', titleKey: 'home.howItWorks.step1.title', descKey: 'home.howItWorks.step1.desc' },
                { step: '2', titleKey: 'home.howItWorks.step2.title', descKey: 'home.howItWorks.step2.desc' },
                { step: '3', titleKey: 'home.howItWorks.step3.title', descKey: 'home.howItWorks.step3.desc' },
              ] as const
            ).map(({ step, titleKey, descKey }) => (
              <div key={step} className="relative text-center">
                <div className="relative z-10 mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-lg font-bold text-white shadow-sm">
                  {step}
                </div>
                <h3 className="text-lg font-semibold text-gray-900">{t(titleKey)}</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-500">{t(descKey)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Bottom CTA ───────────────────────────────────────────── */}
      <section className="bg-blue-600 px-4 py-16">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold text-white">{t('home.cta.title')}</h2>
          <p className="mt-3 text-blue-100">{t('home.cta.subtitle')}</p>
          <Link
            to="/login"
            className="mt-8 inline-block rounded-lg bg-white px-8 py-3 text-base font-semibold text-blue-600 transition-colors hover:bg-blue-50"
          >
            {t('home.cta.button')}
          </Link>
          <p className="mt-4 text-sm text-blue-200">
            {t('home.cta.noAccount')}{' '}
            <Link to="/register" className="font-semibold text-white underline underline-offset-2 hover:text-blue-100">
              {t('home.cta.signUp')}
            </Link>
          </p>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────── */}
      <footer className="border-t border-gray-100 bg-white px-4 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 sm:flex-row">
          <span className="text-sm font-semibold text-blue-600">{t('app.title')}</span>
          <p className="text-xs text-gray-400">{t('home.footer.copyright')}</p>
        </div>
      </footer>

    </div>
  );
};

export default Home;
