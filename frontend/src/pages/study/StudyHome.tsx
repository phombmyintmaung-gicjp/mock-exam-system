import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/store/authStore';
import { LanguageToggle } from '@/components/shared/LanguageToggle';
import { ArrowLeftIcon, BookOpenIcon, ChevronRightIcon, BookmarkIcon } from '@/components/ui/Icons';

interface StudyCardProps {
  to: string;
  emoji: string;
  title: string;
  description: string;
  color: string;
}

const StudyCard = ({ to, emoji, title, description, color }: StudyCardProps) => {
  const { t } = useTranslation();
  return (
    <Link
      to={to}
      className="group flex flex-col items-center gap-4 rounded-3xl border border-white/40 bg-white/80 p-8 shadow-lg backdrop-blur-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-xl dark:border-white/15 dark:bg-slate-800/70"
    >
      <div className={`flex h-20 w-20 items-center justify-center rounded-2xl text-4xl shadow-md ${color}`}>
        {emoji}
      </div>
      <div className="text-center">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white">{title}</h3>
        <p className="mt-1 text-sm text-slate-500 dark:text-white/50">{description}</p>
      </div>
      <span className="mt-auto flex items-center gap-1 text-sm font-semibold text-amber-600 dark:text-amber-400">
        {t('study.startButton')}
        <ChevronRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
      </span>
    </Link>
  );
};

const StudyHome = () => {
  const { t } = useTranslation();
  const token = useAuthStore((s) => s.token);
  const user  = useAuthStore((s) => s.user);
  const backTo = token ? (user?.role === 1 ? '/admin/dashboard' : '/exam/select') : '/login';
  const backLabel = token ? t('study.backToDashboard') : t('study.backToLogin');

  return (
    <div className="relative flex min-h-screen flex-col bg-app overflow-hidden">
      {/* Decorative orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -top-48 -left-48 h-96 w-96 rounded-full bg-amber-400/15 blur-3xl" />
        <div className="absolute top-1/3 -right-32 h-72 w-72 rounded-full bg-rose-400/12 blur-3xl" />
        <div className="absolute -bottom-32 left-1/4 h-64 w-64 rounded-full bg-amber-300/10 blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 py-4">
        <Link
          to={backTo}
          className="flex items-center gap-1.5 rounded-full border border-white/20 bg-white/20 px-3.5 py-1.5 text-sm font-medium text-slate-700 backdrop-blur-sm transition-colors hover:bg-white/30 dark:text-white/70"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          {backLabel}
        </Link>
        <div className="flex items-center gap-2">
          {token && (
            <Link
              to="/study/bookmarks"
              className="flex items-center gap-1.5 rounded-full border border-white/20 bg-white/20 px-3.5 py-1.5 text-sm font-medium text-slate-700 backdrop-blur-sm transition-colors hover:bg-white/30 dark:text-white/70"
            >
              <BookmarkIcon className="h-4 w-4" />
              {t('study.bookmark.title')}
            </Link>
          )}
          <LanguageToggle />
        </div>
      </header>

      {/* Hero */}
      <div className="relative z-10 flex flex-col items-center px-4 pt-10 pb-6 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-amber-500/30">
          <BookOpenIcon className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white sm:text-4xl">
          {t('study.title')}
        </h1>
        <p className="mt-2 max-w-md text-slate-500 dark:text-white/50">{t('study.subtitle')}</p>
      </div>

      {/* Study cards */}
      <main className="relative z-10 mx-auto grid w-full max-w-4xl grid-cols-1 gap-5 px-4 pb-16 sm:grid-cols-3">
        <StudyCard
          to="/study/kanji"
          emoji="漢"
          title={t('study.kanji.title')}
          description={t('study.kanji.description')}
          color="bg-gradient-to-br from-rose-100 to-rose-200 dark:from-rose-500/50 dark:to-rose-600/50"
        />
        <StudyCard
          to="/study/vocab"
          emoji="語"
          title={t('study.vocab.title')}
          description={t('study.vocab.description')}
          color="bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-500/50 dark:to-amber-600/50"
        />
        <StudyCard
          to="/study/grammar"
          emoji="文"
          title={t('study.grammar.title')}
          description={t('study.grammar.description')}
          color="bg-gradient-to-br from-emerald-100 to-emerald-200 dark:from-emerald-500/50 dark:to-emerald-600/50"
        />
      </main>
    </div>
  );
};

export default StudyHome;
