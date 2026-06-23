import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { clsx } from 'clsx';
import { PageShell } from '@/components/layout/PageShell';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { getCustomExamResult } from '@/services/customSetService';
import type { CustomExamResult as CustomResult, CustomAnswerRecord } from '@/types/customSet';

const CustomExamResult = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [result, setResult] = useState<CustomResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showReview, setShowReview] = useState(false);

  useEffect(() => {
    getCustomExamResult(Number(id))
      .then(setResult)
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [id]);

  if (isLoading) {
    return (
      <PageShell>
        <div className="flex min-h-[50vh] items-center justify-center">
          <Spinner size="lg" />
        </div>
      </PageShell>
    );
  }

  if (!result) {
    return (
      <PageShell>
        <p className="text-sm text-gray-500 dark:text-white/50">{t('common.error')}</p>
      </PageShell>
    );
  }

  const pct = Math.round((result.score / result.totalQuestions) * 100);
  const isPassed = result.status === 'pass';

  return (
    <PageShell>
      <div className="mx-auto max-w-lg">
        {/* Score card */}
        <div
          className={clsx(
            'rounded-2xl border p-8 text-center shadow-sm',
            isPassed
              ? 'border-emerald-200 bg-emerald-50 dark:border-emerald-500/30 dark:bg-emerald-500/10'
              : 'border-rose-200 bg-rose-50 dark:border-rose-500/30 dark:bg-rose-500/10',
          )}
        >
          <p className="mb-1 text-sm font-medium text-gray-500 dark:text-white/50">{result.setName}</p>
          <div
            className={clsx(
              'mb-4 text-7xl font-extrabold leading-none',
              isPassed ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500 dark:text-rose-400',
            )}
          >
            {pct}%
          </div>
          <p className="text-lg font-semibold text-gray-700 dark:text-white/80">
            {result.score} / {result.totalQuestions} {t('customExam.result.correct')}
          </p>
          <span
            className={clsx(
              'mt-3 inline-flex items-center rounded-full px-4 py-1 text-sm font-bold',
              isPassed
                ? 'bg-emerald-500 text-white'
                : 'bg-rose-500 text-white',
            )}
          >
            {isPassed ? t('result.pass') : t('result.fail')}
          </span>
          <p className="mt-3 text-xs text-gray-400 dark:text-white/30">
            {t('customExam.result.passingScore', { score: result.passingScore })}
          </p>
        </div>

        {/* Actions */}
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          {result.answerRecords && result.answerRecords.length > 0 && (
            <Button
              label={showReview ? t('customExam.result.hideReview') : t('customExam.result.reviewAnswers')}
              variant="secondary"
              onClick={() => setShowReview((v) => !v)}
            />
          )}
          <Button label={t('customExam.result.done')} onClick={() => navigate('/exam/select')} />
        </div>

        {/* Review answers */}
        {showReview && result.answerRecords && (
          <div className="mt-8 space-y-4">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">
              {t('customExam.result.reviewAnswers')}
            </h2>
            {result.answerRecords.map((ar: CustomAnswerRecord, idx: number) => (
              <div
                key={ar.questionId}
                className={clsx(
                  'rounded-xl border p-4',
                  ar.isCorrect
                    ? 'border-emerald-200 dark:border-emerald-500/30'
                    : 'border-rose-200 dark:border-rose-500/30',
                )}
              >
                <div className="mb-3 flex items-start gap-3">
                  <span
                    className={clsx(
                      'mt-0.5 shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold',
                      ar.isCorrect
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300'
                        : 'bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-300',
                    )}
                  >
                    {idx + 1}
                  </span>
                  <p className="text-sm text-gray-800 dark:text-white/90">{ar.questionText}</p>
                </div>
                <div className="space-y-1.5 pl-7">
                  {ar.choices.map((c) => {
                    const isSelected = c.id === ar.selectedChoiceId;
                    const isCorrect  = c.isCorrect;
                    return (
                      <div
                        key={c.id}
                        className={clsx(
                          'rounded-lg px-3 py-2 text-sm',
                          isCorrect
                            ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-200 font-medium'
                            : isSelected && !isCorrect
                            ? 'bg-rose-50 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300'
                            : 'text-gray-600 dark:text-white/50',
                        )}
                      >
                        {isCorrect ? '✓ ' : isSelected ? '✗ ' : ''}
                        {c.text}
                      </div>
                    );
                  })}
                </div>
                {ar.explanation && (
                  <p className="mt-3 pl-7 text-xs text-gray-500 dark:text-white/40 leading-relaxed">
                    <span className="font-medium">{t('result.explanation')}: </span>
                    {ar.explanation}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </PageShell>
  );
};

export default CustomExamResult;
