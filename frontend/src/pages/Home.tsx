import { Navigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/store/authStore';
import { LanguageToggle } from '@/components/shared/LanguageToggle';
import { ScrollReveal } from '@/components/shared/ScrollReveal';
import { useThemeStore } from '@/store/themeStore';
import { clsx } from 'clsx';
import {
  SunIcon, MoonIcon, CloudIcon, GlobeIcon, ShieldCheckIcon, TerminalIcon,
  ClockIcon, LightbulbIcon, BarChartIcon, DocumentTextIcon, TableCellsIcon,
  BookOpenIcon, ArrowRightIcon,
} from '@/components/ui/Icons';

const IT_CATEGORIES = [
  {
    id: 'AWS',
    labelKey: 'home.categories.awsLabel' as const,
    descKey: 'home.categories.aws' as const,
    gradient: 'from-orange-500 to-amber-500',
    shadow: 'shadow-orange-500/20',
    icon: <CloudIcon className="h-5 w-5 text-white" strokeWidth={1.5} />,
  },
  {
    id: 'Network',
    labelKey: 'home.categories.networkLabel' as const,
    descKey: 'home.categories.network' as const,
    gradient: 'from-blue-500 to-cyan-500',
    shadow: 'shadow-blue-500/20',
    icon: <GlobeIcon className="h-5 w-5 text-white" strokeWidth={1.5} />,
  },
  {
    id: 'Security',
    labelKey: 'home.categories.securityLabel' as const,
    descKey: 'home.categories.security' as const,
    gradient: 'from-rose-500 to-pink-500',
    shadow: 'shadow-rose-500/20',
    icon: <ShieldCheckIcon className="h-5 w-5 text-white" strokeWidth={1.5} />,
  },
  {
    id: 'Linux',
    labelKey: 'home.categories.linuxLabel' as const,
    descKey: 'home.categories.linux' as const,
    gradient: 'from-emerald-500 to-green-500',
    shadow: 'shadow-emerald-500/20',
    icon: <TerminalIcon className="h-5 w-5 text-white" strokeWidth={1.5} />,
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
    return <Navigate to={user.role === 1 ? '/admin/dashboard' : '/exam/select'} replace />;
  }

  return (
    <div className="min-h-screen bg-app">
      {/* Decorative orbs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -top-48 -left-48 h-96 w-96 rounded-full bg-amber-400/18 blur-3xl dark:bg-amber-500/12" />
        <div className="absolute top-1/3 -right-48 h-80 w-80 rounded-full bg-orange-400/15 blur-3xl dark:bg-orange-500/10" />
        <div className="absolute -bottom-48 left-1/3 h-72 w-72 rounded-full bg-amber-300/12 blur-3xl dark:bg-amber-600/10" />
      </div>

      {/* Navbar */}
      <header className="fixed inset-x-0 top-0 z-50 glass border-b border-slate-200/60 dark:border-white/10">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 shadow-md shadow-amber-500/30">
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
              {theme === 'dark' ? <SunIcon className="h-4 w-4" /> : <MoonIcon className="h-4 w-4" />}
            </button>
            <Link
              to="/login"
              className="rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-amber-500/25 transition-all hover:opacity-90"
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
            <span className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-500/10 px-4 py-1.5 text-xs font-semibold text-amber-700 dark:text-amber-300">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-500 dark:bg-amber-400" aria-hidden="true" />
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
              className="w-full rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-8 py-3.5 text-center text-base font-semibold text-white shadow-lg shadow-amber-500/25 transition-all hover:opacity-90 hover:shadow-xl sm:w-auto"
            >
              {t('home.hero.cta')}
            </Link>
            <Link
              to="/study"
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white/80 px-8 py-3.5 text-base font-semibold text-slate-700 backdrop-blur-sm transition-all hover:bg-slate-50 dark:border-white/15 dark:bg-white/8 dark:text-white/85 dark:hover:bg-white/12 sm:w-auto"
            >
              <BookOpenIcon className="h-4 w-4 text-amber-500" />
              {t('home.hero.studyCta')}
            </Link>
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
          ).map(({ value, labelKey }, i) => (
            <ScrollReveal key={labelKey} delay={i * 100} className="text-center">
              <div className="text-gradient-brand text-4xl font-extrabold tabular-nums">{value}</div>
              <div className="mt-1.5 text-sm font-medium text-slate-400 dark:text-white/45">{t(labelKey)}</div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* ── Features ──────────────────────────────────────────── */}
      <section className="px-4 py-20">
        <div className="mx-auto max-w-5xl">
          <ScrollReveal className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">{t('home.features.title')}</h2>
            <p className="mt-3 text-slate-400 dark:text-white/45">{t('home.features.subtitle')}</p>
          </ScrollReveal>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                gradient: 'from-amber-500 to-orange-500',
                shadow: 'shadow-amber-500/20',
                titleKey: 'home.features.exam.title',
                descKey: 'home.features.exam.desc',
                icon: <ClockIcon className="h-5 w-5 text-white" />,
              },
              {
                gradient: 'from-emerald-500 to-teal-500',
                shadow: 'shadow-emerald-500/20',
                titleKey: 'home.features.study.title',
                descKey: 'home.features.study.desc',
                icon: <LightbulbIcon className="h-5 w-5 text-white" />,
              },
              {
                gradient: 'from-orange-500 to-amber-400',
                shadow: 'shadow-orange-500/20',
                titleKey: 'home.features.analytics.title',
                descKey: 'home.features.analytics.desc',
                icon: <BarChartIcon className="h-5 w-5 text-white" />,
              },
              {
                gradient: 'from-rose-500 to-pink-500',
                shadow: 'shadow-rose-500/20',
                titleKey: 'home.features.jlpt.title',
                descKey: 'home.features.jlpt.desc',
                icon: <DocumentTextIcon className="h-5 w-5 text-white" />,
              },
            ].map((feat, i) => (
              <ScrollReveal key={feat.titleKey} delay={i * 100}>
                <div className="glass-card overflow-hidden rounded-2xl transition-all duration-200 hover:-translate-y-1 hover:shadow-lg h-full">
                  <div className={`h-0.5 bg-gradient-to-r ${feat.gradient}`} />
                  <div className="p-5">
                    <div className={`mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br shadow-md ${feat.gradient} ${feat.shadow}`}>
                      {feat.icon}
                    </div>
                    <h3 className="font-semibold text-slate-900 dark:text-white">{t(feat.titleKey as Parameters<typeof t>[0])}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-white/50">{t(feat.descKey as Parameters<typeof t>[0])}</p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── IT Exam Categories ────────────────────────────────── */}
      <section id="categories" className="px-4 py-16">
        <div className="mx-auto max-w-5xl">
          <ScrollReveal>
            <div className="mb-3 flex justify-center">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white/70 px-3 py-1 text-xs font-semibold text-slate-500 dark:border-white/15 dark:bg-white/8 dark:text-white/50">
                <TableCellsIcon className="h-3.5 w-3.5" />
                IT
              </span>
            </div>
            <div className="mb-10 text-center">
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white">{t('home.categories.title')}</h2>
              <p className="mt-3 text-slate-400 dark:text-white/45">{t('home.categories.subtitle')}</p>
            </div>
          </ScrollReveal>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {IT_CATEGORIES.map((cat, i) => (
              <ScrollReveal key={cat.id} delay={i * 100}>
                <div className="glass-card overflow-hidden rounded-2xl transition-all duration-200 hover:-translate-y-1 h-full">
                  <div className={`h-0.5 bg-gradient-to-r ${cat.gradient}`} />
                  <div className="p-5">
                    <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br shadow-md ${cat.gradient} ${cat.shadow}`}>
                      {cat.icon}
                    </div>
                    <h3 className="font-bold text-slate-900 dark:text-white">{t(cat.labelKey)}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-slate-400 dark:text-white/45">{t(cat.descKey)}</p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── JLPT Section ─────────────────────────────────────── */}
      <section className="px-4 py-16">
        <div className="mx-auto max-w-5xl">
          <ScrollReveal>
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
          </ScrollReveal>
        </div>
      </section>

      {/* ── Free Study ────────────────────────────────────────── */}
      <section className="px-4 py-16">
        <div className="mx-auto max-w-5xl">
          <ScrollReveal>
            <div className="glass-card overflow-hidden rounded-3xl">
              <div className="h-0.5 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-400" />
              <div className="px-6 py-10 sm:px-10">
                <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:gap-12">
                  <div className="lg:flex-1">
                    <span className="inline-flex rounded-full bg-amber-500/15 px-2.5 py-0.5 text-xs font-bold text-amber-600 dark:text-amber-300 ring-1 ring-amber-500/20">
                      {t('home.freeStudy.badge')}
                    </span>
                    <h2 className="mt-3 text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
                      {t('home.freeStudy.title')}
                    </h2>
                    <p className="mt-3 text-sm leading-relaxed text-slate-500 dark:text-white/50">
                      {t('home.freeStudy.subtitle')}
                    </p>
                    <Link
                      to="/study"
                      className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-amber-500/20 transition-all hover:opacity-90"
                    >
                      <BookOpenIcon className="h-4 w-4" />
                      {t('home.freeStudy.cta')}
                    </Link>
                  </div>
                  <div className="grid grid-cols-3 gap-3 lg:grid-cols-1 lg:w-60">
                    {[
                      { char: '漢', titleKey: 'study.kanji.title' as const, descKey: 'study.kanji.description' as const, gradient: 'from-rose-500 to-rose-600' },
                      { char: '語', titleKey: 'study.vocab.title' as const, descKey: 'study.vocab.description' as const, gradient: 'from-amber-500 to-orange-500' },
                      { char: '文', titleKey: 'study.grammar.title' as const, descKey: 'study.grammar.description' as const, gradient: 'from-emerald-500 to-teal-500' },
                    ].map((item) => (
                      <div key={item.titleKey} className="flex items-center gap-3 rounded-xl bg-black/3 p-3 ring-1 ring-slate-200/60 dark:bg-white/5 dark:ring-white/10">
                        <div className={clsx('flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br text-sm font-bold text-white', item.gradient)}>
                          {item.char}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-slate-800 dark:text-white/90">{t(item.titleKey)}</p>
                          <p className="truncate text-xs text-slate-400 dark:text-white/40">{t(item.descKey)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ── How It Works ──────────────────────────────────────── */}
      <section className="px-4 py-16">
        <div className="mx-auto max-w-4xl">
          <ScrollReveal className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">{t('home.howItWorks.title')}</h2>
          </ScrollReveal>
          <div className="relative grid gap-10 sm:grid-cols-3">
            <div className="absolute left-[16.66%] right-[16.66%] top-6 hidden h-px bg-gradient-to-r from-amber-300/40 via-orange-300/40 to-amber-300/40 dark:from-white/15 dark:via-white/10 dark:to-white/15 sm:block" aria-hidden="true" />
            {(
              [
                { step: '1', titleKey: 'home.howItWorks.step1.title', descKey: 'home.howItWorks.step1.desc', gradient: 'from-amber-500 to-orange-500', shadow: 'shadow-amber-500/30' },
                { step: '2', titleKey: 'home.howItWorks.step2.title', descKey: 'home.howItWorks.step2.desc', gradient: 'from-orange-500 to-amber-400', shadow: 'shadow-orange-500/30' },
                { step: '3', titleKey: 'home.howItWorks.step3.title', descKey: 'home.howItWorks.step3.desc', gradient: 'from-amber-400 to-orange-400', shadow: 'shadow-amber-400/30' },
              ] as const
            ).map(({ step, titleKey, descKey, gradient, shadow }, i) => (
              <ScrollReveal key={step} delay={i * 150} className="relative text-center">
                <div className={clsx('relative z-10 mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br text-lg font-bold text-white shadow-lg', gradient, shadow)}>
                  {step}
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{t(titleKey)}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400 dark:text-white/45">{t(descKey)}</p>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Bottom CTA ────────────────────────────────────────── */}
      <section className="px-4 py-16">
        <div className="mx-auto max-w-2xl">
          <ScrollReveal>
            <div className="glass-card glow-amber overflow-hidden rounded-3xl text-center">
              <div className="h-0.5 bg-gradient-to-r from-amber-500 to-orange-500" />
              <div className="px-8 py-12">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 shadow-xl shadow-amber-500/30">
                  <span className="text-2xl font-bold text-white">試</span>
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">{t('home.cta.title')}</h2>
                <p className="mt-3 text-slate-500 dark:text-white/50">{t('home.cta.subtitle')}</p>
                <div className="mt-8 flex flex-col items-center gap-3">
                  <Link
                    to="/login"
                    className="rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-8 py-3 text-base font-semibold text-white shadow-lg shadow-amber-500/25 transition-all hover:opacity-90"
                  >
                    {t('home.cta.button')}
                  </Link>
                  <p className="text-sm text-slate-400 dark:text-white/35">
                    {t('home.cta.noAccount')}{' '}
                    <Link to="/register" className="font-semibold text-amber-600 underline underline-offset-2 hover:text-amber-500 dark:text-amber-300 dark:hover:text-amber-200">
                      {t('home.cta.signUp')}
                    </Link>
                  </p>
                </div>
                <div className="mt-6 border-t border-slate-100 dark:border-white/8 pt-6">
                  <p className="text-sm text-slate-400 dark:text-white/35">
                    {t('home.cta.freeStudy')}{' '}
                    <Link to="/study" className="group inline-flex items-center gap-1 font-semibold text-amber-600 hover:text-amber-500 dark:text-amber-300 dark:hover:text-amber-200">
                      {t('home.cta.freeStudyLink')}
                      <ArrowRightIcon className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────── */}
      <footer className="relative border-t border-slate-200/60 dark:border-white/8 bg-slate-50 dark:bg-white/[0.02] px-4 pt-14 pb-8 overflow-hidden">
        {/* subtle background glow */}
        <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-48 w-[600px] rounded-full bg-amber-400/5 blur-3xl" />

        <div className="mx-auto max-w-6xl">
          {/* ── Top grid ── */}
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4 mb-12">

            {/* Brand column */}
            <ScrollReveal delay={0} className="lg:col-span-1 flex flex-col gap-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 shadow-lg shadow-amber-500/30">
                  <span className="text-sm font-bold text-white">試</span>
                </div>
                <span className="text-gradient-brand text-base font-bold tracking-tight">{t('app.title')}</span>
              </div>
              <p className="text-xs leading-relaxed text-slate-400 dark:text-white/35 max-w-[220px]">
                {t('home.footer.tagline')}
              </p>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="inline-flex items-center rounded-full bg-amber-500/10 dark:bg-amber-500/15 px-2.5 py-0.5 text-[10px] font-semibold text-amber-600 dark:text-amber-400 ring-1 ring-amber-500/20">
                  GIC
                </span>
                <span className="text-[10px] text-slate-400 dark:text-white/30">{t('home.footer.madeFor')}</span>
              </div>
            </ScrollReveal>

            {/* IT Certs */}
            <ScrollReveal delay={100} className="flex flex-col gap-3">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-white/30">
                {t('home.footer.itExams')}
              </h3>
              <ul className="flex flex-col gap-2">
                {(['AWS', 'Network', 'Security', 'Linux'] as const).map((cat) => (
                  <li key={cat}>
                    <Link
                      to="/login"
                      className="group flex items-center gap-2 text-sm text-slate-500 dark:text-white/40 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                    >
                      <span className="h-px w-3 bg-current opacity-40 group-hover:w-4 group-hover:opacity-100 transition-all" />
                      {cat}
                    </Link>
                  </li>
                ))}
              </ul>
            </ScrollReveal>

            {/* JLPT */}
            <ScrollReveal delay={200} className="flex flex-col gap-3">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-white/30">
                {t('home.footer.jlptPractice')}
              </h3>
              <ul className="flex flex-col gap-2">
                {(['N1', 'N2', 'N3', 'N4', 'N5'] as const).map((lvl) => (
                  <li key={lvl}>
                    <Link
                      to="/login"
                      className="group flex items-center gap-2 text-sm text-slate-500 dark:text-white/40 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                    >
                      <span className="h-px w-3 bg-current opacity-40 group-hover:w-4 group-hover:opacity-100 transition-all" />
                      JLPT {lvl}
                    </Link>
                  </li>
                ))}
              </ul>
            </ScrollReveal>

            {/* Quick access */}
            <ScrollReveal delay={300} className="flex flex-col gap-3">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-white/30">
                {t('home.footer.quickAccess')}
              </h3>
              <ul className="flex flex-col gap-2">
                <li>
                  <Link
                    to="/login"
                    className="group flex items-center gap-2 text-sm text-slate-500 dark:text-white/40 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                  >
                    <span className="h-px w-3 bg-current opacity-40 group-hover:w-4 group-hover:opacity-100 transition-all" />
                    {t('home.footer.login')}
                  </Link>
                </li>
                <li>
                  <Link
                    to="/study"
                    className="group flex items-center gap-2 text-sm text-slate-500 dark:text-white/40 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                  >
                    <span className="h-px w-3 bg-current opacity-40 group-hover:w-4 group-hover:opacity-100 transition-all" />
                    {t('home.footer.freeFlashcards')}
                  </Link>
                </li>
                <li>
                  <Link
                    to="/login"
                    className="group flex items-center gap-2 text-sm text-slate-500 dark:text-white/40 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                  >
                    <span className="h-px w-3 bg-current opacity-40 group-hover:w-4 group-hover:opacity-100 transition-all" />
                    {t('home.footer.examMode')}
                  </Link>
                </li>
                <li>
                  <Link
                    to="/login"
                    className="group flex items-center gap-2 text-sm text-slate-500 dark:text-white/40 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                  >
                    <span className="h-px w-3 bg-current opacity-40 group-hover:w-4 group-hover:opacity-100 transition-all" />
                    {t('home.footer.studyMode')}
                  </Link>
                </li>
              </ul>
            </ScrollReveal>
          </div>

          {/* ── Divider ── */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-white/8" />
            </div>
            <div className="relative flex justify-center">
              <div className="h-1 w-8 rounded-full bg-gradient-to-r from-amber-400 to-orange-400 opacity-60" />
            </div>
          </div>

          {/* ── Bottom bar ── */}
          <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
            <p className="text-[11px] text-slate-400 dark:text-white/25 text-center sm:text-left">
              {t('home.footer.copyright')}
            </p>
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-gradient-to-br from-amber-400 to-orange-500" />
              <span className="h-1.5 w-1.5 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 opacity-60" />
              <span className="h-1.5 w-1.5 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 opacity-30" />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
