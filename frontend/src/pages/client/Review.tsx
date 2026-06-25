import { useState } from 'react';
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
  const [revealedIds, setRevealedIds] = useState<Set<number>>(new Set());

  const toggleReveal = (questionId: number) => {
    setRevealedIds((prev) => {
      const next = new Set(prev);
      if (next.has(questionId)) next.delete(questionId);
      else next.add(questionId);
      return next;
    });
  };

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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('result.review.title')}</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-white/50">{t('result.review.subtitle')}</p>
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
          <div className="mb-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/5">
            <div className="flex items-center gap-4">
              <p className="text-4xl font-bold text-gray-900 dark:text-white">
                {correctCount}<span className="text-xl text-gray-400 dark:text-white/40">/{total}</span>
              </p>
              <div>
                <p className="text-sm font-semibold text-gray-700 dark:text-white/80">
                  {t('result.scoreLabel')} {total > 0 ? Math.round((correctCount / total) * 100) : 0}%
                </p>
                <p className="text-xs text-gray-400 dark:text-white/40">
                  {t('result.passingScore')} {result?.passingScore ?? 70}%
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-5">
          {isLoading
            ? Array.from({ length: 3 }).map((_, i) => <ReviewItemSkeleton key={i} />)
            : (result?.answers ?? []).map((item, idx) => {
                const unanswered = item.selectedChoiceId === null;
                const revealed   = item.isCorrect || revealedIds.has(item.questionId);
                return (
                <div key={item.questionId} className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-white/10 dark:bg-white/5">
                  <div className="flex items-start gap-3 border-b border-gray-100 bg-gray-50 px-6 py-4 dark:border-white/8 dark:bg-white/5">
                    <span
                      className={clsx(
                        'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold',
                        unanswered
                          ? 'bg-gray-300 text-gray-600 dark:bg-white/15 dark:text-white/70'
                          : item.isCorrect ? 'bg-green-500 text-white' : 'bg-red-500 text-white',
                      )}
                    >
                      {unanswered ? (
                        <span style={{ fontSize: '9px', lineHeight: 1 }}>—</span>
                      ) : item.isCorrect ? (
                        <CheckIcon className="h-3 w-3" strokeWidth={3} style={{ animation: 'scale-in 0.15s ease-out' }} />
                      ) : (
                        <XIcon className="h-3 w-3" strokeWidth={3} style={{ animation: 'scale-in 0.15s ease-out' }} />
                      )}
                    </span>
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-semibold uppercase text-gray-400 dark:text-white/40">Q{idx + 1}</span>
                        {unanswered && (
                          <span className="text-xs font-semibold text-gray-400 dark:text-white/40">{t('result.unanswered')}</span>
                        )}
                        {!unanswered && item.timeTakenSeconds !== null && item.timeTakenSeconds !== undefined && (
                          <span className="text-xs text-slate-400 dark:text-white/40">
                            {t('result.review.timeTaken')}: {formatSeconds(item.timeTakenSeconds)}
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 text-sm font-medium text-gray-900 dark:text-white">{item.questionText}</p>
                    </div>
                  </div>

                  <div className="space-y-2 px-6 py-4">
                    {item.choices.map((choice) => {
                      const isCorrectChoice = choice.id === item.correctChoiceId;
                      const isWrongSelected = choice.id === item.selectedChoiceId && !item.isCorrect;
                      return (
                        <div
                          key={choice.id}
                          className={clsx(
                            'rounded-lg border px-4 py-2.5 text-sm',
                            revealed && isCorrectChoice
                              ? 'border-green-400 bg-green-50 font-medium text-green-800 dark:border-green-500/40 dark:bg-green-500/10 dark:text-green-300'
                              : isWrongSelected
                              ? 'border-red-400 bg-red-50 font-medium text-red-700 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-300'
                              : 'border-gray-200 text-gray-600 dark:border-white/10 dark:text-white/60',
                          )}
                        >
                          {choice.text}
                          {revealed && isCorrectChoice && (
                            <span className="ml-2 inline-flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                              <CheckIcon className="h-3 w-3" strokeWidth={3} />
                              {t('result.correct')}
                            </span>
                          )}
                          {isWrongSelected && (
                            <span className="ml-2 inline-flex items-center gap-1 text-xs text-red-500 dark:text-red-400">
                              <XIcon className="h-3 w-3" strokeWidth={3} />
                              {t('result.incorrect')}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* See Answer / Hide button for wrong and unanswered */}
                  {!item.isCorrect && (
                    <div className="border-t border-gray-100 px-6 py-3 dark:border-white/8">
                      <button
                        onClick={() => toggleReveal(item.questionId)}
                        className="text-xs font-semibold text-amber-600 hover:text-amber-700 transition-colors"
                      >
                        {revealedIds.has(item.questionId)
                          ? t('result.hideAnswer')
                          : t('result.seeAnswer')}
                      </button>
                    </div>
                  )}

                  {/* Explanation — only when revealed */}
                  {revealed && item.explanation && (
                    <div className="border-t border-amber-100 bg-amber-50 px-6 py-4 dark:border-amber-500/20 dark:bg-amber-500/10">
                      <p className="mb-1 text-xs font-semibold uppercase text-amber-700 dark:text-amber-300">
                        {t('result.review.explanation')}
                      </p>
                      <p className="text-sm text-gray-700 dark:text-white/80">{item.explanation}</p>
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      </div>
    </PageShell>
  );
};

export default Review;
