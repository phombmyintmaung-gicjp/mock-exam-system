import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { clsx } from 'clsx';
import { PageShell } from '@/components/layout/PageShell';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { getCustomExamResult } from '@/services/customSetService';
import type { CustomExamResult as CustomResult } from '@/types/customSet';

const CustomExamResult = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [result, setResult] = useState<CustomResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
        <div className="mt-6 flex justify-center">
          <Button label={t('customExam.result.done')} onClick={() => navigate('/exam/select')} />
        </div>
      </div>
    </PageShell>
  );
};

export default CustomExamResult;
