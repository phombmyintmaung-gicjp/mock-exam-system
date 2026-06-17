import { useState } from 'react';
import { clsx } from 'clsx';
import type { Flashcard } from '@/types/flashcard';
import { Furigana } from '@/components/shared/Furigana';

interface FlipCardProps {
  card: Flashcard;
}

export function FlipCard({ card }: FlipCardProps) {
  const [flipped, setFlipped] = useState(false);

  return (
    <div
      className="relative h-72 w-full max-w-sm cursor-pointer select-none sm:h-80"
      style={{ perspective: '1200px' }}
      onClick={() => setFlipped((f) => !f)}
    >
      <div
        className="relative h-full w-full transition-transform duration-500"
        style={{
          transformStyle: 'preserve-3d',
          transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >
        {/* Front */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center rounded-3xl border border-amber-200/60 bg-gradient-to-br from-white to-amber-50 p-6 shadow-xl dark:border-amber-400/20 dark:from-slate-800 dark:to-slate-700"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-amber-500 dark:text-amber-400">
            {card.type}
          </p>
          <p className="text-center text-5xl font-bold text-slate-900 dark:text-white">
            {card.front}
          </p>
          <p className="mt-6 text-xs text-slate-400 dark:text-white/30">タップして答えを見る</p>
        </div>

        {/* Back */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-3xl border border-slate-200/60 bg-gradient-to-br from-slate-50 to-white p-6 shadow-xl dark:border-white/10 dark:from-slate-700 dark:to-slate-800"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          {card.reading && (
            <p className="text-lg font-medium text-amber-600 dark:text-amber-400">{card.reading}</p>
          )}
          <p className="text-center text-2xl font-bold text-slate-900 dark:text-white">{card.meaning}</p>
          {card.example_sentence && (
            <div className="mt-2 w-full rounded-xl bg-slate-100 px-4 py-3 dark:bg-white/8">
              <p className="text-center text-sm leading-loose text-slate-700 dark:text-white/80">
                <Furigana text={card.example_sentence} />
              </p>
              {card.example_translation && (
                <p className="mt-1 text-center text-xs text-slate-400 dark:text-white/40">{card.example_translation}</p>
              )}
            </div>
          )}
          <p className="mt-2 text-xs text-slate-400 dark:text-white/30">タップして戻る</p>
        </div>
      </div>

      {/* Flip hint dot */}
      <div className={clsx(
        'absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 transition-opacity duration-300',
        flipped ? 'opacity-0' : 'opacity-60',
      )}>
        <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
        <span className="h-1.5 w-1.5 rounded-full bg-amber-300" />
        <span className="h-1.5 w-1.5 rounded-full bg-amber-200" />
      </div>
    </div>
  );
}
