import type { ReactNode } from 'react';
import { clsx } from 'clsx';
import type { Question } from '@/types/exam';
import { CheckIcon, XIcon } from '@/components/ui/Icons';

interface QuestionCardProps {
  question: Question;
  selectedChoiceId?: number;
  onSelect: (choiceId: number) => void;
  revealed?: boolean;
}

const CHOICE_LABELS = ['A', 'B', 'C', 'D', 'E', 'F'];

const QuestionCard = ({ question, selectedChoiceId, onSelect, revealed = false }: QuestionCardProps) => {
  return (
    <div className="glass-card rounded-2xl p-6 shadow-xl shadow-black/8 dark:shadow-black/20">
      <p className="mb-6 text-base font-medium leading-relaxed text-slate-800 dark:text-white/90">
        {question.text}
      </p>
      <ul className="space-y-3">
        {question.choices.map((choice, idx) => {
          const isSelected = selectedChoiceId === choice.id;
          const isCorrect = choice.isCorrect;
          const label = CHOICE_LABELS[idx] ?? String(idx + 1);

          let rowClass: string;
          let badgeClass: string;
          let icon: ReactNode = null;

          if (revealed) {
            if (isCorrect) {
              rowClass = 'border-emerald-400/50 bg-emerald-500/15 text-emerald-800 dark:text-emerald-200';
              badgeClass = 'bg-emerald-500 text-white';
              icon = <CheckIcon className="h-3 w-3" strokeWidth={3} style={{ animation: 'scale-in 0.15s ease-out' }} />;
            } else if (isSelected) {
              rowClass = 'border-rose-400/50 bg-rose-500/15 text-rose-800 dark:text-rose-200';
              badgeClass = 'bg-rose-500 text-white';
              icon = <XIcon className="h-3 w-3" strokeWidth={3} style={{ animation: 'scale-in 0.15s ease-out' }} />;
            } else {
              rowClass = 'border-slate-200/50 dark:border-white/5 bg-black/3 dark:bg-white/3 text-slate-400 dark:text-white/35';
              badgeClass = 'bg-black/5 dark:bg-white/8 text-slate-300 dark:text-white/25';
            }
          } else {
            rowClass = isSelected
              ? 'border-amber-400/50 bg-amber-500/20 text-amber-900 dark:text-white shadow-sm shadow-amber-500/10'
              : 'border-slate-200 dark:border-white/10 bg-black/5 dark:bg-white/5 text-slate-600 dark:text-white/70 hover:border-slate-300 dark:hover:border-white/25 hover:bg-black/5 dark:hover:bg-white/10 hover:text-slate-800 dark:hover:text-white/90';
            badgeClass = isSelected
              ? 'bg-amber-500 text-white'
              : 'bg-black/5 dark:bg-white/10 text-slate-400 dark:text-white/40 group-hover:bg-black/8 dark:group-hover:bg-white/20 group-hover:text-slate-600 dark:group-hover:text-white/70';
          }

          return (
            <li key={choice.id}>
              <button
                onClick={() => onSelect(choice.id)}
                disabled={revealed}
                aria-pressed={isSelected}
                className={clsx(
                  'group flex w-full items-start gap-3 rounded-xl border px-4 py-3 text-left text-sm font-medium transition-all',
                  revealed ? 'cursor-default' : 'cursor-pointer',
                  rowClass,
                )}
              >
                <span className={clsx('flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-xs font-bold transition-colors', badgeClass)}>
                  {icon ?? label}
                </span>
                <span className="mt-0.5 flex-1">{choice.text}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export { QuestionCard };
