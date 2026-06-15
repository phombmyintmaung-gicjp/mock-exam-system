import { clsx } from 'clsx';
import type { Question } from '@/types/exam';

interface QuestionCardProps {
  question: Question;
  selectedChoiceId?: number;
  onSelect: (choiceId: number) => void;
}

const CHOICE_LABELS = ['A', 'B', 'C', 'D', 'E', 'F'];

const QuestionCard = ({ question, selectedChoiceId, onSelect }: QuestionCardProps) => {
  return (
    <div className="glass-card rounded-2xl p-6 shadow-xl shadow-black/8 dark:shadow-black/20">
      <p className="mb-6 text-base font-medium leading-relaxed text-slate-800 dark:text-white/90">
        {question.text}
      </p>
      <ul className="space-y-3">
        {question.choices.map((choice, idx) => {
          const isSelected = selectedChoiceId === choice.id;
          const label = CHOICE_LABELS[idx] ?? String(idx + 1);
          return (
            <li key={choice.id}>
              <button
                onClick={() => onSelect(choice.id)}
                aria-pressed={isSelected}
                className={clsx(
                  'group flex w-full items-start gap-3 rounded-xl border px-4 py-3 text-left text-sm font-medium transition-all',
                  isSelected
                    ? 'border-indigo-400/50 bg-indigo-500/20 text-white shadow-sm shadow-indigo-500/10'
                    : 'border-slate-200 dark:border-white/10 bg-black/5 dark:bg-white/5 text-slate-600 dark:text-white/70 hover:border-slate-300 dark:hover:border-white/25 hover:bg-black/5 dark:hover:bg-white/10 hover:text-slate-800 dark:hover:text-white/90',
                )}
              >
                <span
                  className={clsx(
                    'flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-xs font-bold transition-colors',
                    isSelected
                      ? 'bg-indigo-500 text-white'
                      : 'bg-black/5 dark:bg-white/10 text-slate-400 dark:text-white/40 group-hover:bg-black/8 dark:group-hover:bg-white/20 group-hover:text-slate-600 dark:group-hover:text-white/70',
                  )}
                >
                  {label}
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
