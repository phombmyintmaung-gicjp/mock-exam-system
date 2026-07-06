import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { clsx } from 'clsx';
import { FlashcardBrowser } from '@/components/shared/FlashcardBrowser';
import { Spinner } from '@/components/ui/Spinner';
import { getBookmarkedFlashcards, removeBookmark } from '@/services/flashcardService';
import type { Flashcard } from '@/types/flashcard';
import { ArrowLeftIcon, ShuffleIcon } from '@/components/ui/Icons';

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Browses only the current user's bookmarked flashcards, using the same viewer as regular study.
const BookmarkedFlashcards = () => {
  const { t } = useTranslation();

  const [cards, setCards]         = useState<Flashcard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError]         = useState(false);
  const [shuffled, setShuffled]   = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(false);
    try {
      const data = await getBookmarkedFlashcards();
      setCards(shuffled ? shuffle(data) : data);
    } catch {
      setError(true);
    } finally {
      setIsLoading(false);
    }
  }, [shuffled]);

  useEffect(() => { void load(); }, [load]);

  const toggleBookmark = async (flashcardId: number) => {
    setCards((prev) => prev.filter((c) => c.id !== flashcardId));
    try {
      await removeBookmark(flashcardId);
    } catch {
      void load();
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center bg-app overflow-hidden">
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -top-48 -left-48 h-96 w-96 rounded-full bg-amber-400/12 blur-3xl" />
        <div className="absolute -bottom-32 right-0 h-72 w-72 rounded-full bg-rose-400/10 blur-3xl" />
      </div>

      <header className="relative z-10 flex w-full items-center justify-between px-6 py-4">
        <Link
          to="/study"
          className="flex items-center gap-1.5 rounded-full border border-white/20 bg-white/20 px-3.5 py-1.5 text-sm font-medium text-slate-700 backdrop-blur-sm transition-colors hover:bg-white/30 dark:text-white/70"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          {t('study.backToStudy')}
        </Link>
        <h1 className="text-lg font-bold text-slate-900 dark:text-white">{t('study.bookmark.title')}</h1>
        <button
          onClick={() => setShuffled((s) => !s)}
          title={t('study.shuffle')}
          className={clsx(
            'flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors',
            shuffled
              ? 'border-amber-400 bg-amber-500 text-white'
              : 'border-white/20 bg-white/20 text-slate-600 hover:bg-white/30 dark:text-white/60',
          )}
        >
          <ShuffleIcon className="h-4 w-4" />
          {t('study.shuffle')}
        </button>
      </header>

      <p className="relative z-10 mb-6 max-w-md px-4 text-center text-sm text-slate-500 dark:text-white/50">
        {t('study.bookmark.description')}
      </p>

      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 pb-10 w-full">
        {isLoading ? (
          <Spinner size="lg" />
        ) : error ? (
          <p className="text-rose-500">{t('common.error')}</p>
        ) : (
          <FlashcardBrowser
            cards={cards}
            emptyMessage={t('study.bookmark.empty')}
            bookmarkedIds={new Set(cards.map((c) => c.id))}
            onToggleBookmark={(id) => { void toggleBookmark(id); }}
          />
        )}
      </main>
    </div>
  );
};

export default BookmarkedFlashcards;
