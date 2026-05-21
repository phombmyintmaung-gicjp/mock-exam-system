import { clsx } from 'clsx';
import type { Question } from '@/types/exam';

interface QuestionCardProps {
  question: Question;
  selectedChoiceId?: number;
  onSelect: (choiceId: number) => void;
}

const QuestionCard = ({ question, selectedChoiceId, onSelect }: QuestionCardProps) => {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <p className="mb-6 text-base font-medium leading-relaxed text-gray-900">
        {question.text}
      </p>
      <ul className="space-y-3">
        {question.choices.map((choice) => {
          const isSelected = selectedChoiceId === choice.id;
          return (
            <li key={choice.id}>
              <button
                onClick={() => onSelect(choice.id)}
                aria-pressed={isSelected}
                className={clsx(
                  'w-full rounded-lg border px-4 py-3 text-left text-sm font-medium transition-colors',
                  isSelected
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-blue-300 hover:bg-blue-50',
                )}
              >
                {choice.text}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export { QuestionCard };
