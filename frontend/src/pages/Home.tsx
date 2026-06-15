import { Navigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/store/authStore';
import { LanguageToggle } from '@/components/shared/LanguageToggle';
import { useThemeStore } from '@/store/themeStore';
import { clsx } from 'clsx';

const SunIcon = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);
const MoonIcon = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
  </svg>
);

const IT_CATEGORIES = [
  {
    id: 'AWS',
    labelKey: 'home.categories.awsLabel' as const,
    descKey: 'home.categories.aws' as const,
    gradient: 'from-orange-500 to-amber-500',
    shadow: 'shadow-orange-500/20',
    icon: (
      <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-3.758-3.848 5.25 5.25 0 00-10.233 2.33A4.502 4.502 0 002.25 15z" />
      </svg>
    ),
  },
  {
    id: 'Network',
    labelKey: 'home.categories.networkLabel' as const,
    descKey: 'home.categories.network' as const,
    gradient: 'from-blue-500 to-cyan-500',
    shadow: 'shadow-blue-500/20',
    icon: (
      <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
      </svg>
    ),
  },
  {
    id: 'Security',
    labelKey: 'home.categories.securityLabel' as const,
    descKey: 'home.categories.security' as const,
    gradient: 'from-rose-500 to-pink-500',
    shadow: 'shadow-rose-500/20',
    icon: (
      <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
  },
  {
    id: 'Linux',
    labelKey: 'home.categories.linuxLabel' as const,
    descKey: 'home.categories.linux' as const,
    gradient: 'from-emerald-500 to-green-500',
    shadow: 'shadow-emerald-500/20',
    icon: (
      <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 7.5l3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0021 18V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v12a2.25 2.25 0 002.25 2.25z" />
      </svg>
    ),
  },
];

const JLPT_LEVELS = [
  { level: 'N1', gradient: 'from-rose-500 to-rose-600', ring: 'ring-rose-400/30', bg: 'bg-rose-500/10 dark:bg-rose-500/15', text: 'text-rose-600 dark:text-rose-300', descKey: 'home.jlpt.n1' as const },
  { level: 'N2', gradient: 'from-orange-500 to-amber-500', ring: 'ring-orange-400/30', bg: 'bg-orange-500/10 dark:bg-orange-500/15', text: 'text-orange-600 dark:text-orange-300', descKey: 'home.jlpt.n2' as const },
  { level: 'N3', gradient: 'from-yellow-500 to-lime-500', ring: 'ring-yellow-400/30', bg: 'bg-yellow-500/10 dark:bg-yellow-500/15', text: 'text-yellow-600 dark:text-yellow-300', descKey: 'home.jlpt.n3' as const },
  { level: 'N4', gradient: 'from-emerald-500 to-teal-500', ring: 'ring-emerald-400/30', bg: 'bg-emerald-500/10 dark:bg-emerald-500/15', text: 'text-emerald-600 dark:text-emerald-300', descKey: 'home.jlpt.n4' as const },
  { level: 'N5', gradient: 'from-blue-500 to-cyan-500', ring: 'ring-blue-400/30', bg: 'bg-blue-500/10 dark:bg-blue-500/15', text: 'text-blue-600 dark:text-blue-300', descKey: 'home.jlpt.n5' as const },
];

const Home = () => {
  const { t } = useTranslation();
  const { token, user } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();

  if (token && user) {
    return <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/exam/select'} replace />;
  }

  return (
    <div className="min-h-screen bg-app">
      {/* Decorative orbs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -top-48 -left-48 h-96 w-96 rounded-full bg-purple-600/20 blur-3xl dark:bg-rose-600/18" />
        <div className="absolute top-1/3 -right-48 h-80 w-80 rounded-full bg-indigo-600/20 blur-3xl dark:bg-amber-500/12" />
        <div className="absolute -bottom-48 left-1/3 h-72 w-72 rounded-full bg-violet-600/15 blur-3xl dark:bg-pink-700/15" />
      </div>

      {/* Navbar */}
      <header className="fixed inset-x-0 top-0 z-50 glass border-b border-slate-200/60 dark:border-white/10">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 shadow-md shadow-indigo-500/30">
              <span className="text-xs font-bold text-white">試</span>
            </div>
            <span className="text-gradient-brand text-xl font-bold">{t('app.title')}</span>
          </div>
          <div className="flex items-center gap-2">
            <LanguageToggle />
            <button
              onClick={toggleTheme}
              className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-black/5 dark:text-white/60 dark:hover:bg-white/10 dark:hover:text-white"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
            </button>
            <Link
              to="/login"
              className="rounded-lg bg-gradient-to-r from-indigo-500 to-violet-500 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-indigo-500/25 transition-all hover:opacity-90"
            >
              {t('auth.login')}
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ────────────────────────────────────────────── */}
      <section className="relative px-4 pb-20 pt-32 sm:pt-40">
        <div className="mx-auto max-w-4xl">
          <div className="mb-5 flex justify-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-indigo-400/30 bg-indigo-500/10 px-4 py-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-300">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 dark:bg-indigo-400" aria-hidden="true" />
              {t('home.hero.badge')}
            </span>
          </div>

          <h1 className="text-center text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-5xl lg:text-6xl">
            {t('home.hero.titleLine1')}
            <span className="block text-gradient-brand mt-1">{t('home.hero.titleLine2')}</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-center text-lg leading-relaxed text-slate-500 dark:text-white/55">
            {t('home.hero.subtitle')}
          </p>

          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              to="/login"
              className="w-full rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 px-8 py-3.5 text-center text-base font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:opacity-90 hover:shadow-xl sm:w-auto"
            >
              {t('home.hero.cta')}
            </Link>
            <a
              href="#categories"
              className="w-full rounded-xl border border-slate-200 bg-white/80 px-8 py-3.5 text-center text-base font-semibold text-slate-700 backdrop-blur-sm transition-all hover:bg-slate-50 dark:border-white/15 dark:bg-white/8 dark:text-white/85 dark:hover:bg-white/12 sm:w-auto"
            >
              {t('home.hero.explore')}
            </a>
          </div>

          {/* Trust line */}
          <p className="mt-6 text-center text-sm text-slate-400 dark:text-white/35">
            {t('home.hero.trustLine')}
          </p>
        </div>
      </section>

      {/* ── Stats ────────────────────────────────────────────── */}
      <section className="border-y border-slate-100 dark:border-white/8 px-4 py-10">
        <div className="mx-auto grid max-w-4xl grid-cols-2 gap-6 sm:grid-cols-4">
          {(
            [
              { value: '4', labelKey: 'home.stats.itCerts' },
              { value: '5', labelKey: 'home.stats.jlptLevels' },
              { value: '100+', labelKey: 'home.stats.questions' },
              { value: '∞', labelKey: 'home.stats.attempts' },
            ] as const
          ).map(({ value, labelKey }) => (
            <div key={labelKey} className="text-center">
              <div className="text-gradient-brand text-4xl font-extrabold tabular-nums">{value}</div>
              <div className="mt-1.5 text-sm font-medium text-slate-400 dark:text-white/45">{t(labelKey)}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ──────────────────────────────────────────── */}
      <section className="px-4 py-20">
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">{t('home.features.title')}</h2>
            <p className="mt-3 text-slate-400 dark:text-white/45">{t('home.features.subtitle')}</p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                gradient: 'from-indigo-500 to-violet-500',
                shadow: 'shadow-indigo-500/20',
                titleKey: 'home.features.exam.title',
                descKey: 'home.features.exam.desc',
                icon: <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
              },
              {
                gradient: 'from-emerald-500 to-teal-500',
                shadow: 'shadow-emerald-500/20',
                titleKey: 'home.features.study.title',
                descKey: 'home.features.study.desc',
                icon: <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>,
              },
              {
                gradient: 'from-violet-500 to-purple-500',
                shadow: 'shadow-violet-500/20',
                titleKey: 'home.features.analytics.title',
                descKey: 'home.features.analytics.desc',
                icon: <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
              },
              {
                gradient: 'from-rose-500 to-pink-500',
                shadow: 'shadow-rose-500/20',
                titleKey: 'home.features.jlpt.title',
                descKey: 'home.features.jlpt.desc',
                icon: <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
              },
            ].map((feat) => (
              <div key={feat.titleKey} className="glass-card overflow-hidden rounded-2xl transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
                <div className={`h-0.5 bg-gradient-to-r ${feat.gradient}`} />
                <div className="p-5">
                  <div className={`mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br shadow-md ${feat.gradient} ${feat.shadow}`}>
                    {feat.icon}
                  </div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">{t(feat.titleKey as Parameters<typeof t>[0])}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-white/50">{t(feat.descKey as Parameters<typeof t>[0])}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── IT Exam Categories ────────────────────────────────── */}
      <section id="categories" className="px-4 py-16">
        <div className="mx-auto max-w-5xl">
          <div className="mb-3 flex justify-center">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white/70 px-3 py-1 text-xs font-semibold text-slate-500 dark:border-white/15 dark:bg-white/8 dark:text-white/50">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18" /></svg>
              IT
            </span>
          </div>
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">{t('home.categories.title')}</h2>
            <p className="mt-3 text-slate-400 dark:text-white/45">{t('home.categories.subtitle')}</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {IT_CATEGORIES.map((cat) => (
              <div key={cat.id} className="glass-card overflow-hidden rounded-2xl transition-all duration-200 hover:-translate-y-1">
                <div className={`h-0.5 bg-gradient-to-r ${cat.gradient}`} />
                <div className="p-5">
                  <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br shadow-md ${cat.gradient} ${cat.shadow}`}>
                    {cat.icon}
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white">{t(cat.labelKey)}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-slate-400 dark:text-white/45">{t(cat.descKey)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── JLPT Section ─────────────────────────────────────── */}
      <section className="px-4 py-16">
        <div className="mx-auto max-w-5xl">
          <div className="glass-card overflow-hidden rounded-3xl">
            <div className="h-1 bg-gradient-to-r from-rose-500 via-orange-400 via-yellow-400 via-emerald-500 to-blue-500" />
            <div className="px-6 py-10 sm:px-10">

              <div className="mb-2 flex items-center gap-2">
                <span className="rounded-full bg-rose-500/15 px-2.5 py-0.5 text-xs font-bold text-rose-500 dark:text-rose-400 ring-1 ring-rose-500/20">
                  {t('home.jlpt.badge')}
                </span>
              </div>

              <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-12">
                <div className="lg:max-w-xs">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">{t('home.jlpt.title')}</h2>
                  <p className="mt-3 text-sm leading-relaxed text-slate-500 dark:text-white/50">{t('home.jlpt.subtitle')}</p>

                  <div className="mt-5 flex flex-wrap gap-2">
                    <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white/60 px-3 py-2 dark:border-white/12 dark:bg-white/6">
                      <span className="text-base">文字語彙</span>
                      <span className="text-xs text-slate-500 dark:text-white/45">{t('home.jlpt.mojiGoiShort')}</span>
                    </div>
                    <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white/60 px-3 py-2 dark:border-white/12 dark:bg-white/6">
                      <span className="text-base">文法読解</span>
                      <span className="text-xs text-slate-500 dark:text-white/45">{t('home.jlpt.bunpoShort')}</span>
                    </div>
                  </div>
                </div>

                <div className="flex-1">
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                    {JLPT_LEVELS.map((lv) => (
                      <div key={lv.level} className={clsx('flex items-center gap-3 rounded-xl p-3 ring-1', lv.bg, lv.ring)}>
                        <div className={clsx('flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br text-sm font-extrabold text-white shadow-md', lv.gradient)}>
                          {lv.level}
                        </div>
                        <div>
                          <p className={clsx('text-sm font-semibold', lv.text)}>{lv.level}</p>
                          <p className="text-xs text-slate-500 dark:text-white/45">{t(lv.descKey)}</p>
                        </div>
                        <div className="ml-auto flex gap-1.5">
                          <span className="rounded-md bg-white/60 px-1.5 py-0.5 text-xs font-medium text-slate-500 ring-1 ring-slate-200/60 dark:bg-white/8 dark:text-white/45 dark:ring-white/12">
                            文字語彙
                          </span>
                          <span className="rounded-md bg-white/60 px-1.5 py-0.5 text-xs font-medium text-slate-500 ring-1 ring-slate-200/60 dark:bg-white/8 dark:text-white/45 dark:ring-white/12">
                            文法読解
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── How It Works ──────────────────────────────────────── */}
      <section className="px-4 py-16">
        <div className="mx-auto max-w-4xl">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">{t('home.howItWorks.title')}</h2>
          </div>

          <div className="relative grid gap-10 sm:grid-cols-3">
            <div className="absolute left-[16.66%] right-[16.66%] top-6 hidden h-px bg-gradient-to-r from-indigo-300/40 via-violet-300/40 to-indigo-300/40 dark:from-white/15 dark:via-white/10 dark:to-white/15 sm:block" aria-hidden="true" />
            {(
              [
                { step: '1', titleKey: 'home.howItWorks.step1.title', descKey: 'home.howItWorks.step1.desc', gradient: 'from-indigo-500 to-violet-600', shadow: 'shadow-indigo-500/30' },
                { step: '2', titleKey: 'home.howItWorks.step2.title', descKey: 'home.howItWorks.step2.desc', gradient: 'from-violet-500 to-purple-600', shadow: 'shadow-violet-500/30' },
                { step: '3', titleKey: 'home.howItWorks.step3.title', descKey: 'home.howItWorks.step3.desc', gradient: 'from-purple-500 to-pink-500', shadow: 'shadow-purple-500/30' },
              ] as const
            ).map(({ step, titleKey, descKey, gradient, shadow }) => (
              <div key={step} className="relative text-center">
                <div className={clsx('relative z-10 mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br text-lg font-bold text-white shadow-lg', gradient, shadow)}>
                  {step}
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{t(titleKey)}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400 dark:text-white/45">{t(descKey)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Bottom CTA ────────────────────────────────────────── */}
      <section className="px-4 py-16">
        <div className="mx-auto max-w-2xl">
          <div className="glass-card glow-indigo overflow-hidden rounded-3xl text-center">
            <div className="h-0.5 bg-gradient-to-r from-indigo-500 to-violet-500" />
            <div className="px-8 py-12">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-xl shadow-indigo-500/30">
                <span className="text-2xl font-bold text-white">試</span>
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">{t('home.cta.title')}</h2>
              <p className="mt-3 text-slate-500 dark:text-white/50">{t('home.cta.subtitle')}</p>
              <Link
                to="/login"
                className="mt-8 inline-block rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 px-8 py-3 text-base font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:opacity-90"
              >
                {t('home.cta.button')}
              </Link>
              <p className="mt-4 text-sm text-slate-400 dark:text-white/35">
                {t('home.cta.noAccount')}{' '}
                <Link to="/register" className="font-semibold text-indigo-500 underline underline-offset-2 hover:text-indigo-400 dark:text-indigo-300 dark:hover:text-indigo-200">
                  {t('home.cta.signUp')}
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────── */}
      <footer className="border-t border-slate-100 dark:border-white/8 px-4 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 sm:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600">
              <span className="text-xs font-bold text-white">試</span>
            </div>
            <span className="text-gradient-brand text-sm font-bold">{t('app.title')}</span>
          </div>
          <p className="text-xs text-slate-300 dark:text-white/30">{t('home.footer.copyright')}</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
