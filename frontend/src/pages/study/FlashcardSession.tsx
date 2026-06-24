import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { clsx } from 'clsx';
import { FlipCard } from '@/components/shared/FlipCard';
import { Spinner } from '@/components/ui/Spinner';
import { getFlashcards, getDueFlashcards, submitSrsReview, type SrsRating } from '@/services/flashcardService';
import type { Flashcard, FlashcardType, FlashcardLevel } from '@/types/flashcard';
import { useAuthStore } from '@/store/authStore';
import { ArrowLeftIcon, ShuffleIcon, FolderIcon, ChevronLeftIcon, ChevronRightIcon, CheckCircleIcon } from '@/components/ui/Icons';

const LEVELS: FlashcardLevel[] = ['N1', 'N2', 'N3', 'N4', 'N5'];

type SessionMode = 'browse' | 'review';

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const SRS_RATINGS: { rating: SrsRating; labelKey: string; color: string }[] = [
  { rating: 0, labelKey: 'study.srs.again', color: 'bg-red-500 hover:bg-red-600 text-white' },
  { rating: 1, labelKey: 'study.srs.hard',  color: 'bg-orange-400 hover:bg-orange-500 text-white' },
  { rating: 2, labelKey: 'study.srs.good',  color: 'bg-blue-500 hover:bg-blue-600 text-white' },
  { rating: 3, labelKey: 'study.srs.easy',  color: 'bg-emerald-500 hover:bg-emerald-600 text-white' },
];

const FlashcardSession = () => {
  const { type } = useParams<{ type: string }>();
  const { t } = useTranslation();
  const token = useAuthStore((s) => s.token);

  const [mode, setMode]           = useState<SessionMode>('browse');
  const [level, setLevel]         = useState<FlashcardLevel | ''>('');
  const [cards, setCards]         = useState<Flashcard[]>([]);
  const [index, setIndex]         = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError]         = useState(false);
  const [shuffled, setShuffled]   = useState(false);
  const [flipped, setFlipped]     = useState(false);
  const [reviewed, setReviewed]   = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const flashcardType = (type as FlashcardType) ?? 'kanji';

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(false);
    setIndex(0);
    setReviewed(0);
    setFlipped(false);
    try {
      if (mode === 'review' && token) {
        const data = await getDueFlashcards(flashcardType, level || undefined);
        setCards(data);
      } else {
        const data = await getFlashcards(flashcardType, level || undefined);
        setCards(shuffled ? shuffle(data) : data);
      }
    } catch {
      setError(true);
    } finally {
      setIsLoading(false);
    }
  }, [flashcardType, level, shuffled, mode, token]);

  useEffect(() => { void load(); }, [load]);

  // Reset flip state when navigating to a new card
  useEffect(() => { setFlipped(false); }, [index]);

  const prev = () => setIndex((i) => Math.max(0, i - 1));
  const next = () => setIndex((i) => Math.min(cards.length - 1, i + 1));

  const handleRate = async (rating: SrsRating) => {
    if (submitting) return;
    setSubmitting(true);
    try {
      await submitSrsReview(cards[index].id, rating);
      setReviewed((r) => r + 1);
      if (index < cards.length - 1) {
        setIndex((i) => i + 1);
      }
    } catch {
      // silently continue — card still advances
      setReviewed((r) => r + 1);
      if (index < cards.length - 1) setIndex((i) => i + 1);
    } finally {
      setSubmitting(false);
    }
  };

  const typeLabel: Record<FlashcardType, string> = {
    kanji:   t('study.kanji.title'),
    vocab:   t('study.vocab.title'),
    grammar: t('study.grammar.title'),
  };

  const isDone = mode === 'review' && reviewed === cards.length && cards.length > 0;

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
        {mode === 'browse' ? (
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
        ) : (
          <div className="w-[80px]" />
        )}
      </header>

      {/* Mode toggle — only shown when logged in */}
      {token && (
        <div className="relative z-10 mb-2 flex gap-1 rounded-full border border-slate-200 bg-white/60 p-1 backdrop-blur-sm dark:border-white/10 dark:bg-white/5">
          <button
            onClick={() => setMode('browse')}
            className={clsx(
              'rounded-full px-4 py-1.5 text-sm font-medium transition-colors',
              mode === 'browse'
                ? 'bg-amber-500 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 dark:text-white/50 dark:hover:text-white',
            )}
          >
            {t('study.modeBrowse')}
          </button>
          <button
            onClick={() => setMode('review')}
            className={clsx(
              'rounded-full px-4 py-1.5 text-sm font-medium transition-colors',
              mode === 'review'
                ? 'bg-indigo-500 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 dark:text-white/50 dark:hover:text-white',
            )}
          >
            {t('study.modeReview')}
          </button>
        </div>
      )}

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
        ) : isDone ? (
          <div className="flex flex-col items-center gap-4 text-center">
            <CheckCircleIcon className="h-16 w-16 text-emerald-500" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">{t('study.srs.allReviewed')}</h2>
            <p className="text-sm text-slate-500 dark:text-white/50">{t('study.srs.comeBackLater')}</p>
            <button
              onClick={load}
              className="mt-2 rounded-xl bg-indigo-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-600"
            >
              {t('study.srs.reviewAgain')}
            </button>
          </div>
        ) : cards.length === 0 ? (
          <div className="text-center">
            <FolderIcon className="mx-auto h-12 w-12 text-slate-300 dark:text-white/20" strokeWidth={1.5} />
            <p className="mt-3 text-slate-500 dark:text-white/40">
              {mode === 'review' ? t('study.srs.noDue') : t('study.noCards')}
            </p>
          </div>
        ) : (
          <div className="flex w-full max-w-sm flex-col items-center gap-6">
            {/* Progress */}
            <p className="text-sm font-medium text-slate-500 dark:text-white/40">
              {mode === 'review'
                ? `${reviewed} / ${cards.length} ${t('study.srs.reviewed')}`
                : `${index + 1} / ${cards.length}`}
            </p>

            {/* Flip card — pass onFlip to detect when card is flipped */}
            <FlipCard
              key={`${cards[index].id}-${index}`}
              card={cards[index]}
              onFlip={() => setFlipped(true)}
            />

            {/* SRS rating buttons — shown after card is flipped in review mode */}
            {mode === 'review' && flipped && (
              <div className="flex w-full gap-2">
                {SRS_RATINGS.map(({ rating, labelKey, color }) => (
                  <button
                    key={rating}
                    onClick={() => { void handleRate(rating); }}
                    disabled={submitting}
                    className={clsx(
                      'flex-1 rounded-xl py-2.5 text-sm font-semibold transition-colors disabled:opacity-50',
                      color,
                    )}
                  >
                    {t(labelKey)}
                  </button>
                ))}
              </div>
            )}

            {/* Browse mode navigation */}
            {mode === 'browse' && (
              <div className="flex items-center gap-4">
                <button
                  onClick={prev}
                  disabled={index === 0}
                  className="flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm transition-all hover:border-amber-400 hover:shadow-md disabled:opacity-30 dark:border-white/10 dark:bg-white/5"
                >
                  <ChevronLeftIcon className="h-5 w-5 text-slate-600 dark:text-white/60" />
                </button>

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
            )}

            {/* Browse mode done state */}
            {mode === 'browse' && index === cards.length - 1 && (
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
