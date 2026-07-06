import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { clsx } from 'clsx';
import { FlipCard } from '@/components/shared/FlipCard';
import { FlashcardBrowser } from '@/components/shared/FlashcardBrowser';
import { Spinner } from '@/components/ui/Spinner';
import { Modal } from '@/components/ui/Modal';
import {
  getFlashcards, getDueFlashcards, submitSrsReview, type SrsRating,
  getBookmarkedFlashcards, addBookmark, removeBookmark,
  getCustomFlashcardSets, createCustomFlashcardSet, deleteCustomFlashcardSet,
} from '@/services/flashcardService';
import type { Flashcard, FlashcardType, FlashcardLevel, CustomFlashcardSet } from '@/types/flashcard';
import { useAuthStore } from '@/store/authStore';
import { ArrowLeftIcon, ShuffleIcon, FolderIcon, CheckCircleIcon, XIcon, BookmarkIcon } from '@/components/ui/Icons';

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
  const [levels, setLevels]       = useState<FlashcardLevel[]>([]);
  const [cards, setCards]         = useState<Flashcard[]>([]);
  const [index, setIndex]         = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError]         = useState(false);
  const [shuffled, setShuffled]   = useState(false);
  const [flipped, setFlipped]     = useState(false);
  const [reviewed, setReviewed]   = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const [bookmarkedIds, setBookmarkedIds] = useState<Set<number>>(new Set());
  const [customSets, setCustomSets]       = useState<CustomFlashcardSet[]>([]);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [setName, setSetName]             = useState('');
  const [savingSet, setSavingSet]         = useState(false);

  const flashcardType = (type as FlashcardType) ?? 'kanji';

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(false);
    setIndex(0);
    setReviewed(0);
    setFlipped(false);
    try {
      if (mode === 'review' && token) {
        const data = await getDueFlashcards(flashcardType, levels);
        setCards(data);
      } else {
        const data = await getFlashcards(flashcardType, levels);
        setCards(shuffled ? shuffle(data) : data);
      }
    } catch {
      setError(true);
    } finally {
      setIsLoading(false);
    }
  }, [flashcardType, levels, shuffled, mode, token]);

  useEffect(() => { void load(); }, [load]);

  // Reset flip state when navigating to a new card
  useEffect(() => { setFlipped(false); }, [index]);

  // Load the user's bookmarks and saved sets once logged in
  useEffect(() => {
    if (!token) return;
    void getBookmarkedFlashcards().then((data) => setBookmarkedIds(new Set(data.map((c) => c.id)))).catch(() => {});
    void getCustomFlashcardSets(flashcardType).then(setCustomSets).catch(() => {});
  }, [token, flashcardType]);

  const toggleLevel = (l: FlashcardLevel) => {
    setLevels((prev) => (prev.includes(l) ? prev.filter((x) => x !== l) : [...prev, l]));
  };

  const toggleBookmark = async (flashcardId: number) => {
    const wasBookmarked = bookmarkedIds.has(flashcardId);
    setBookmarkedIds((prev) => {
      const next = new Set(prev);
      if (wasBookmarked) next.delete(flashcardId); else next.add(flashcardId);
      return next;
    });
    try {
      if (wasBookmarked) await removeBookmark(flashcardId);
      else await addBookmark(flashcardId);
    } catch {
      // revert on failure
      setBookmarkedIds((prev) => {
        const next = new Set(prev);
        if (wasBookmarked) next.add(flashcardId); else next.delete(flashcardId);
        return next;
      });
    }
  };

  const applySet = (set: CustomFlashcardSet) => setLevels(set.levels);

  const handleDeleteSet = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    setCustomSets((prev) => prev.filter((s) => s.id !== id));
    try {
      await deleteCustomFlashcardSet(id);
    } catch {
      void getCustomFlashcardSets(flashcardType).then(setCustomSets).catch(() => {});
    }
  };

  const handleSaveSet = async () => {
    if (!setName.trim() || levels.length === 0 || savingSet) return;
    setSavingSet(true);
    try {
      const created = await createCustomFlashcardSet({ name: setName.trim(), type: flashcardType, levels });
      setCustomSets((prev) => [...prev, created]);
      setShowSaveModal(false);
      setSetName('');
    } catch {
      // leave modal open so the user can retry
    } finally {
      setSavingSet(false);
    }
  };

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

      {/* Level filter — multi-select */}
      <div className="relative z-10 mb-2 flex flex-wrap justify-center gap-2 px-4">
        <button
          onClick={() => setLevels([])}
          className={clsx(
            'rounded-full border px-4 py-1 text-sm font-medium transition-colors',
            levels.length === 0
              ? 'border-amber-500 bg-amber-500 text-white'
              : 'border-slate-200 text-slate-600 hover:border-amber-400 dark:border-white/15 dark:text-white/55',
          )}
        >
          {t('admin.passages.allLevels')}
        </button>
        {LEVELS.map((l) => (
          <button
            key={l}
            onClick={() => toggleLevel(l)}
            className={clsx(
              'rounded-full border px-4 py-1 text-sm font-medium transition-colors',
              levels.includes(l)
                ? 'border-amber-500 bg-amber-500 text-white'
                : 'border-slate-200 text-slate-600 hover:border-amber-400 dark:border-white/15 dark:text-white/55',
            )}
          >
            {l}
          </button>
        ))}
      </div>

      {/* Custom study sets — only shown when logged in */}
      {token && (
        <div className="relative z-10 mb-6 flex w-full max-w-2xl flex-wrap items-center justify-center gap-2 px-4">
          {customSets.map((set) => (
            <button
              key={set.id}
              onClick={() => applySet(set)}
              className="group flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700 transition-colors hover:bg-indigo-100 dark:border-indigo-400/30 dark:bg-indigo-500/10 dark:text-indigo-300"
            >
              {set.name}
              <span className="text-indigo-400 dark:text-indigo-400/70">({set.levels.join('+')})</span>
              <span
                role="button"
                onClick={(e) => { void handleDeleteSet(e, set.id); }}
                className="rounded-full p-0.5 text-indigo-300 transition-colors hover:bg-indigo-200 hover:text-indigo-600 dark:text-indigo-400/50 dark:hover:bg-indigo-500/20"
              >
                <XIcon className="h-3 w-3" />
              </span>
            </button>
          ))}
          {levels.length > 0 && (
            <button
              onClick={() => setShowSaveModal(true)}
              className="flex items-center gap-1.5 rounded-full border border-dashed border-slate-300 px-3 py-1 text-xs font-medium text-slate-500 transition-colors hover:border-amber-400 hover:text-amber-600 dark:border-white/20 dark:text-white/50"
            >
              + {t('study.customSet.save')}
            </button>
          )}
        </div>
      )}

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
        ) : mode === 'browse' ? (
          <FlashcardBrowser
            cards={cards}
            emptyMessage={t('study.noCards')}
            bookmarkedIds={bookmarkedIds}
            onToggleBookmark={token ? (id) => { void toggleBookmark(id); } : undefined}
          />
        ) : cards.length === 0 ? (
          <div className="text-center">
            <FolderIcon className="mx-auto h-12 w-12 text-slate-300 dark:text-white/20" strokeWidth={1.5} />
            <p className="mt-3 text-slate-500 dark:text-white/40">{t('study.srs.noDue')}</p>
          </div>
        ) : (
          <div className="flex w-full max-w-sm flex-col items-center gap-6">
            <p className="text-sm font-medium text-slate-500 dark:text-white/40">
              {reviewed} / {cards.length} {t('study.srs.reviewed')}
            </p>

            <FlipCard
              key={`${cards[index].id}-${index}`}
              card={cards[index]}
              onFlip={() => setFlipped(true)}
            />

            {flipped && (
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
          </div>
        )}
      </main>

      {/* Save custom set modal */}
      <Modal isOpen={showSaveModal} title={t('study.customSet.namePrompt')} onClose={() => setShowSaveModal(false)}>
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-white/40">
            <BookmarkIcon className="h-4 w-4" />
            {typeLabel[flashcardType]} — {levels.join(' + ')}
          </div>
          <input
            type="text"
            value={setName}
            onChange={(e) => setSetName(e.target.value)}
            placeholder={t('study.customSet.namePrompt')}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-amber-400 focus:outline-none dark:border-white/15 dark:bg-white/5 dark:text-white"
          />
          <button
            onClick={() => { void handleSaveSet(); }}
            disabled={!setName.trim() || savingSet}
            className="rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-amber-600 disabled:opacity-50"
          >
            {t('study.customSet.save')}
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default FlashcardSession;
