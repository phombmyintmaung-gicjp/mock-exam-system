import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { clsx } from 'clsx';
import { FlipCard } from '@/components/shared/FlipCard';
import { Spinner } from '@/components/ui/Spinner';
import { getFlashcards } from '@/services/flashcardService';
import type { Flashcard, FlashcardType, FlashcardLevel } from '@/types/flashcard';
import { ArrowLeftIcon, ShuffleIcon, FolderIcon, ChevronLeftIcon, ChevronRightIcon, CheckCircleIcon } from '@/components/ui/Icons';

const LEVELS: FlashcardLevel[] = ['N1', 'N2', 'N3', 'N4', 'N5'];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const FlashcardSession = () => {
  const { type } = useParams<{ type: string }>();
  const { t } = useTranslation();

  const [level, setLevel]       = useState<FlashcardLevel | ''>('');
  const [cards, setCards]       = useState<Flashcard[]>([]);
  const [index, setIndex]       = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError]       = useState(false);
  const [shuffled, setShuffled] = useState(false);

  const flashcardType = (type as FlashcardType) ?? 'kanji';

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(false);
    setIndex(0);
    try {
      const data = await getFlashcards(flashcardType, level || undefined);
      setCards(shuffled ? shuffle(data) : data);
    } catch {
      setError(true);
    } finally {
      setIsLoading(false);
    }
  }, [flashcardType, level, shuffled]);

  useEffect(() => { void load(); }, [load]);

  const prev = () => setIndex((i) => Math.max(0, i - 1));
  const next = () => setIndex((i) => Math.min(cards.length - 1, i + 1));

  const typeLabel: Record<FlashcardType, string> = {
    kanji:   t('study.kanji.title'),
    vocab:   t('study.vocab.title'),
    grammar: t('study.grammar.title'),
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center bg-app overflow-hidden">
      {/* Decorative orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -top-48 -left-48 h-96 w-96 rounded-full bg-amber-400/12 blur-3xl" />
        <div className="absolute -bottom-32 right-0 h-72 w-72 rounded-full bg-rose-400/10 blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative z-10 flex w-full items-center justify-between px-6 py-4">
        <Link
          to="/study"
          className="flex items-center gap-1.5 rounded-full border border-white/20 bg-white/20 px-3.5 py-1.5 text-sm font-medium text-slate-700 backdrop-blur-sm transition-colors hover:bg-white/30 dark:text-white/70"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          {t('study.backToStudy')}
        </Link>
        <h1 className="text-lg font-bold text-slate-900 dark:text-white">
          {typeLabel[flashcardType]}
        </h1>
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

      {/* Level filter */}
      <div className="relative z-10 mb-6 flex flex-wrap justify-center gap-2 px-4">
        <button
          onClick={() => setLevel('')}
          className={clsx(
            'rounded-full border px-4 py-1 text-sm font-medium transition-colors',
            level === ''
              ? 'border-amber-500 bg-amber-500 text-white'
              : 'border-slate-200 text-slate-600 hover:border-amber-400 dark:border-white/15 dark:text-white/55',
          )}
        >
          {t('admin.passages.allLevels')}
        </button>
        {LEVELS.map((l) => (
          <button
            key={l}
            onClick={() => setLevel(l)}
            className={clsx(
              'rounded-full border px-4 py-1 text-sm font-medium transition-colors',
              level === l
                ? 'border-amber-500 bg-amber-500 text-white'
                : 'border-slate-200 text-slate-600 hover:border-amber-400 dark:border-white/15 dark:text-white/55',
            )}
          >
            {l}
          </button>
        ))}
      </div>

      {/* Card area */}
      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 pb-10 w-full">
        {isLoading ? (
          <Spinner size="lg" />
        ) : error ? (
          <p className="text-rose-500">{t('common.error')}</p>
        ) : cards.length === 0 ? (
          <div className="text-center">
            <FolderIcon className="mx-auto h-12 w-12 text-slate-300 dark:text-white/20" strokeWidth={1.5} />
            <p className="mt-3 text-slate-500 dark:text-white/40">{t('study.noCards')}</p>
          </div>
        ) : (
          <div className="flex w-full max-w-sm flex-col items-center gap-6">
            {/* Progress */}
            <p className="text-sm font-medium text-slate-500 dark:text-white/40">
              {index + 1} / {cards.length}
            </p>

            {/* Flip card */}
            <FlipCard key={`${cards[index].id}-${index}`} card={cards[index]} />

            {/* Navigation */}
            <div className="flex items-center gap-4">
              <button
                onClick={prev}
                disabled={index === 0}
                className="flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm transition-all hover:border-amber-400 hover:shadow-md disabled:opacity-30 dark:border-white/10 dark:bg-white/5"
              >
                <ChevronLeftIcon className="h-5 w-5 text-slate-600 dark:text-white/60" />
              </button>

              {/* Progress bar */}
              <div className="h-1.5 w-40 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
                <div
                  className="h-full rounded-full bg-amber-500 transition-all duration-300"
                  style={{ width: `${((index + 1) / cards.length) * 100}%` }}
                />
              </div>

              <button
                onClick={next}
                disabled={index === cards.length - 1}
                className="flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm transition-all hover:border-amber-400 hover:shadow-md disabled:opacity-30 dark:border-white/10 dark:bg-white/5"
              >
                <ChevronRightIcon className="h-5 w-5 text-slate-600 dark:text-white/60" />
              </button>
            </div>

            {/* Done state */}
            {index === cards.length - 1 && (
              <p className="flex items-center gap-1.5 text-center text-sm text-amber-600 dark:text-amber-400">
                <CheckCircleIcon className="h-4 w-4" />
                {t('study.allDone')}
              </p>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default FlashcardSession;
