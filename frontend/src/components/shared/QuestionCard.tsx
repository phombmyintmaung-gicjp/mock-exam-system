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
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="mb-6 text-base font-medium leading-relaxed text-slate-800">
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
                    ? 'border-indigo-500 bg-gradient-to-r from-indigo-50 to-violet-50 text-indigo-700 shadow-sm'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-indigo-300 hover:bg-indigo-50/50',
                )}
              >
                <span
                  className={clsx(
                    'flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-xs font-bold transition-colors',
                    isSelected
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 text-slate-500 group-hover:bg-indigo-100 group-hover:text-indigo-600',
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
