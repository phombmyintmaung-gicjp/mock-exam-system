import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';

function formatSeconds(s: number): string {
  if (s < 60) return `${s}s`;
  return `${Math.floor(s / 60)}m ${s % 60}s`;
}
import { clsx } from 'clsx';
import { PageShell } from '@/components/layout/PageShell';
import { Shimmer, ReviewItemSkeleton } from '@/components/ui/Shimmer';
import useResults from '@/hooks/useResults';
import { CheckIcon, XIcon } from '@/components/ui/Icons';

const Review = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { result, isLoading } = useResults(Number(id));

  const correctCount = result?.answers.filter((a) => a.isCorrect).length ?? 0;
  const total = result?.answers.length ?? 0;

  return (
    <PageShell>
      <div className="mx-auto max-w-3xl">
        <div className="mb-6">
          <button
            onClick={() => navigate(`/exam/results/${id}`)}
            className="mb-4 flex items-center gap-1.5 text-sm font-medium text-slate-500 dark:text-white/50 hover:text-slate-800 dark:hover:text-white transition-colors"
          >
            {t('result.title')}
          </button>
          <h1 className="text-2xl font-bold text-gray-900">{t('result.review.title')}</h1>
          <p className="mt-1 text-sm text-gray-500">{t('result.review.subtitle')}</p>
        </div>

        {isLoading ? (
          <div className="mb-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-4">
              <Shimmer className="h-10 w-20" />
              <div>
                <Shimmer className="mb-2 h-4 w-36" />
                <Shimmer className="h-3 w-24" />
              </div>
            </div>
          </div>
        ) : (
          <div className="mb-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-4">
              <p className="text-4xl font-bold text-gray-900">
                {correctCount}<span className="text-xl text-gray-400">/{total}</span>
              </p>
              <div>
                <p className="text-sm font-semibold text-gray-700">
                  {t('result.scoreLabel')} {total > 0 ? Math.round((correctCount / total) * 100) : 0}%
                </p>
                <p className="text-xs text-gray-400">
                  {t('result.passingScore')} {result?.passingScore ?? 70}%
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-5">
          {isLoading
            ? Array.from({ length: 3 }).map((_, i) => <ReviewItemSkeleton key={i} />)
            : (result?.answers ?? []).map((item, idx) => (
                <div key={item.questionId} className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                  <div className="flex items-start gap-3 border-b border-gray-100 bg-gray-50 px-6 py-4">
                    <span
                      className={clsx(
                        'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold',
                        item.isCorrect ? 'bg-green-500 text-white' : 'bg-red-500 text-white',
                      )}
                    >
                      {item.isCorrect ? (
                        <CheckIcon className="h-3 w-3" strokeWidth={3} style={{ animation: 'scale-in 0.15s ease-out' }} />
                      ) : (
                        <XIcon className="h-3 w-3" strokeWidth={3} style={{ animation: 'scale-in 0.15s ease-out' }} />
                      )}
                    </span>
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-semibold uppercase text-gray-400">Q{idx + 1}</span>
                        {item.timeTakenSeconds !== null && item.timeTakenSeconds !== undefined && (
                          <span className="text-xs text-slate-400">
                            {t('result.review.timeTaken')}: {formatSeconds(item.timeTakenSeconds)}
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 text-sm font-medium text-gray-900">{item.questionText}</p>
                    </div>
                  </div>

                  <div className="space-y-2 px-6 py-4">
                    {item.choices.map((choice) => {
                      const isCorrectChoice  = choice.id === item.correctChoiceId;
                      const isWrongSelected  = choice.id === item.selectedChoiceId && !item.isCorrect;
                      return (
                        <div
                          key={choice.id}
                          className={clsx(
                            'rounded-lg border px-4 py-2.5 text-sm',
                            isCorrectChoice && 'border-green-400 bg-green-50 font-medium text-green-800',
                            isWrongSelected && 'border-red-400 bg-red-50 font-medium text-red-700',
                            !isCorrectChoice && !isWrongSelected && 'border-gray-200 text-gray-600',
                          )}
                        >
                          {choice.text}
                          {isCorrectChoice && (
                            <span className="ml-2 text-xs text-green-600">← {t('result.correct')}</span>
                          )}
                          {isWrongSelected && (
                            <span className="ml-2 text-xs text-red-500">← {t('result.incorrect')}</span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {item.explanation && (
                    <div className="border-t border-amber-100 bg-amber-50 px-6 py-4">
                      <p className="mb-1 text-xs font-semibold uppercase text-amber-700">
                        {t('result.review.explanation')}
                      </p>
                      <p className="text-sm text-gray-700">{item.explanation}</p>
                    </div>
                  )}
                </div>
              ))}
        </div>
      </div>
    </PageShell>
  );
};

export default Review;
