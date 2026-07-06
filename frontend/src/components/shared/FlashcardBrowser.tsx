import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FlipCard } from '@/components/shared/FlipCard';
import { FolderIcon, ChevronLeftIcon, ChevronRightIcon, CheckCircleIcon } from '@/components/ui/Icons';
import type { Flashcard } from '@/types/flashcard';

interface FlashcardBrowserProps {
  cards: Flashcard[];
  emptyMessage: string;
  bookmarkedIds?: Set<number>;
  onToggleBookmark?: (id: number) => void;
}

// Free-browse card viewer (flip/prev/next) shared by regular study and the bookmarked-cards page.
export function FlashcardBrowser({ cards, emptyMessage, bookmarkedIds, onToggleBookmark }: FlashcardBrowserProps) {
  const { t } = useTranslation();
  const [index, setIndex] = useState(0);

  // Reset position whenever the underlying card list changes (new filter, new fetch, etc.)
  useEffect(() => { setIndex(0); }, [cards]);

  const prev = () => setIndex((i) => Math.max(0, i - 1));
  const next = () => setIndex((i) => Math.min(cards.length - 1, i + 1));

  if (cards.length === 0) {
    return (
      <div className="text-center">
        <FolderIcon className="mx-auto h-12 w-12 text-slate-300 dark:text-white/20" strokeWidth={1.5} />
        <p className="mt-3 text-slate-500 dark:text-white/40">{emptyMessage}</p>
      </div>
    );
  }

  // Clamp defensively: `cards` can shrink (e.g. a card removed from a filtered/bookmarked list)
  // in the same render pass that `index` still reflects the old, now out-of-bounds position —
  // the reset effect above only fires on the *next* render.
  const safeIndex = Math.min(index, cards.length - 1);
  const current = cards[safeIndex];

  return (
    <div className="flex w-full max-w-sm flex-col items-center gap-6">
      <p className="text-sm font-medium text-slate-500 dark:text-white/40">
        {safeIndex + 1} / {cards.length}
      </p>

      <FlipCard
        key={`${current.id}-${safeIndex}`}
        card={current}
        isBookmarked={bookmarkedIds?.has(current.id)}
        onToggleBookmark={onToggleBookmark ? () => onToggleBookmark(current.id) : undefined}
      />

      <div className="flex items-center gap-4">
        <button
          onClick={prev}
          disabled={safeIndex === 0}
          className="flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm transition-all hover:border-amber-400 hover:shadow-md disabled:opacity-30 dark:border-white/10 dark:bg-white/5"
        >
          <ChevronLeftIcon className="h-5 w-5 text-slate-600 dark:text-white/60" />
        </button>

        <div className="h-1.5 w-40 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
          <div
            className="h-full rounded-full bg-amber-500 transition-all duration-300"
            style={{ width: `${((safeIndex + 1) / cards.length) * 100}%` }}
          />
        </div>

        <button
          onClick={next}
          disabled={safeIndex === cards.length - 1}
          className="flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm transition-all hover:border-amber-400 hover:shadow-md disabled:opacity-30 dark:border-white/10 dark:bg-white/5"
        >
          <ChevronRightIcon className="h-5 w-5 text-slate-600 dark:text-white/60" />
        </button>
      </div>

      {safeIndex === cards.length - 1 && (
        <p className="flex items-center gap-1.5 text-center text-sm text-amber-600 dark:text-amber-400">
          <CheckCircleIcon className="h-4 w-4" />
          {t('study.allDone')}
        </p>
      )}
    </div>
  );
}
