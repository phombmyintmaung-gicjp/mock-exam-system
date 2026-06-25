import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { clsx } from 'clsx';
import { PageShell } from '@/components/layout/PageShell';
import { Spinner } from '@/components/ui/Spinner';
import { ChevronLeftIcon, TriangleAlertIcon } from '@/components/ui/Icons';
import { getSetResultDetail } from '@/services/customSetService';
import type { AdminCustomExamResultDetail, CustomAnswerRecord } from '@/types/customSet';

const CustomSetResultDetail = () => {
  const { t } = useTranslation();
  const { id, resultId } = useParams<{ id: string; resultId: string }>();
  const [result, setResult] = useState<AdminCustomExamResultDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [revealedIds, setRevealedIds] = useState<Set<number>>(new Set());

  const toggleReveal = (questionId: number) => {
    setRevealedIds((prev) => {
      const next = new Set(prev);
      if (next.has(questionId)) next.delete(questionId);
      else next.add(questionId);
      return next;
    });
  };

  useEffect(() => {
    getSetResultDetail(Number(id), Number(resultId))
      .then(setResult)
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [id, resultId]);

  const fmt = (iso: string) =>
    new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });

  if (isLoading) {
    return (
      <PageShell>
        <div className="flex min-h-[40vh] items-center justify-center">
          <Spinner size="lg" />
        </div>
      </PageShell>
    );
  }

  if (!result) {
    return (
      <PageShell>
        <p className="text-sm text-gray-400 dark:text-white/30">{t('common.error')}</p>
      </PageShell>
    );
  }

  const pct = Math.round((result.score / result.totalQuestions) * 100);
  const isPassed = result.status === 'pass';

  return (
    <PageShell>
      {/* Header */}
      <div className="mb-6">
        <Link
          to={`/admin/custom-sets/${id}/results`}
          className="mb-3 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 dark:text-white/40 dark:hover:text-white/70"
        >
          <ChevronLeftIcon className="h-3.5 w-3.5" />
          {t('admin.customSets.backToResults')}
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t('admin.customSets.resultDetail')}
        </h1>
      </div>

      {result.submittedBy === 'violation' && (
        <div className="mb-6 rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 dark:border-orange-500/30 dark:bg-orange-500/10">
          <div className="flex items-center gap-2 mb-2">
            <TriangleAlertIcon className="h-4 w-4 shrink-0 text-orange-500 dark:text-orange-400" />
            <p className="text-sm font-semibold text-orange-700 dark:text-orange-300">
              {t('result.submittedByViolation')}
            </p>
          </div>
          {result.violationLog && result.violationLog.length > 0 && (
            <ol className="mt-1 space-y-0.5 pl-6 text-xs text-orange-600 dark:text-orange-400">
              {result.violationLog.map((v, i) => (
                <li key={i}>
                  <span className="font-medium">{i + 1}.</span>{' '}
                  {t(`result.violationType.${v.type}`)}{' '}
                  <span className="opacity-60">
                    {new Date(v.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
                  </span>
                </li>
              ))}
            </ol>
          )}
        </div>
      )}

      {/* Summary card */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Employee */}
        <div className="rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-white/30 mb-1">
            {t('admin.customSets.employee')}
          </p>
          <p className="font-semibold text-gray-900 dark:text-white">{result.user.name}</p>
          <p className="text-xs text-gray-400 dark:text-white/35 mt-0.5">{result.user.email}</p>
        </div>

        {/* Score */}
        <div className="rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-white/30 mb-1">
            {t('admin.customSets.colScore')}
          </p>
          <p className="text-2xl font-extrabold text-gray-900 dark:text-white">
            {pct}%
          </p>
          <p className="text-xs text-gray-400 dark:text-white/35 mt-0.5">
            {result.score} / {result.totalQuestions} {t('customExam.result.correct')}
          </p>
        </div>

        {/* Status */}
        <div className="rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-white/30 mb-1">
            {t('admin.customSets.colStatus')}
          </p>
          <span
            className={clsx(
              'mt-1 inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold',
              isPassed
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300'
                : 'bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-300',
            )}
          >
            {isPassed ? t('result.pass') : t('result.fail')}
          </span>
          <p className="text-xs text-gray-400 dark:text-white/35 mt-1.5">
            {t('customExam.result.passingScore', { score: result.passingScore })}
          </p>
        </div>

        {/* Date */}
        <div className="rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-white/30 mb-1">
            {t('admin.customSets.colDate')}
          </p>
          <p className="text-sm font-medium text-gray-700 dark:text-white/75">
            {fmt(result.completedAt)}
          </p>
        </div>
      </div>

      {/* Answer breakdown */}
      <h2 className="mb-4 text-base font-semibold text-gray-900 dark:text-white">
        {t('admin.customSets.answerBreakdown')}
      </h2>

      {result.answerRecords.length === 0 && (
        <div className="rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 px-6 py-10 text-center">
          <p className="text-sm text-gray-400 dark:text-white/30">
            {t('admin.customSets.noAnswerRecords')}
          </p>
        </div>
      )}

      <div className="space-y-4">
        {result.answerRecords.map((ar: CustomAnswerRecord, idx: number) => {
          const unanswered = ar.selectedChoiceId === null;
          const revealed   = ar.isCorrect || revealedIds.has(ar.questionId);
          return (
          <div
            key={ar.questionId}
            className={clsx(
              'rounded-xl border p-5',
              unanswered
                ? 'border-gray-200 dark:border-white/10 bg-white dark:bg-white/5'
                : ar.isCorrect
                ? 'border-emerald-200 dark:border-emerald-500/25 bg-white dark:bg-emerald-500/5'
                : 'border-rose-200 dark:border-rose-500/25 bg-white dark:bg-rose-500/5',
            )}
          >
            {/* Question header */}
            <div className="mb-3 flex items-start gap-3">
              <span
                className={clsx(
                  'mt-0.5 shrink-0 rounded-full px-2.5 py-0.5 text-xs font-bold',
                  unanswered
                    ? 'bg-gray-100 text-gray-400 dark:bg-white/10 dark:text-white/35'
                    : ar.isCorrect
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300'
                    : 'bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-300',
                )}
              >
                Q{idx + 1}
              </span>
              <p className="flex-1 text-sm font-medium text-gray-800 dark:text-white/90 leading-relaxed">
                {ar.questionText}
              </p>
              <span
                className={clsx(
                  'shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold',
                  unanswered
                    ? 'bg-gray-200 text-gray-500 dark:bg-white/15 dark:text-white/40'
                    : ar.isCorrect
                    ? 'bg-emerald-500 text-white'
                    : 'bg-rose-500 text-white',
                )}
              >
                {unanswered ? t('admin.customSets.unanswered') : ar.isCorrect ? t('result.correct') : t('result.incorrect')}
              </span>
            </div>

            {/* Choices */}
            <div className="space-y-1.5 pl-9">
              {ar.choices.map((c) => {
                const isSelected = c.id === ar.selectedChoiceId;
                const isCorrect  = c.isCorrect;
                return (
                  <div
                    key={c.id}
                    className={clsx(
                      'flex items-start gap-2 rounded-lg px-3 py-2 text-sm',
                      revealed && isCorrect
                        ? 'bg-emerald-50 dark:bg-emerald-500/15 font-medium text-emerald-800 dark:text-emerald-200'
                        : isSelected
                        ? 'bg-rose-50 dark:bg-rose-500/15 text-rose-700 dark:text-rose-300'
                        : 'text-gray-500 dark:text-white/40',
                    )}
                  >
                    <span className="shrink-0 mt-0.5 w-4 text-center font-bold">
                      {revealed && isCorrect ? '✓' : isSelected ? '✗' : ''}
                    </span>
                    <span>{c.text}</span>
                    {revealed && isCorrect && !isSelected && (
                      <span className="ml-auto shrink-0 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                        {t('admin.customSets.correctAnswer')}
                      </span>
                    )}
                    {revealed && isSelected && isCorrect && (
                      <span className="ml-auto shrink-0 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                        {t('admin.customSets.selectedCorrect')}
                      </span>
                    )}
                    {isSelected && !isCorrect && (
                      <span className="ml-auto shrink-0 text-xs font-semibold text-rose-500 dark:text-rose-400">
                        {t('admin.customSets.selectedWrong')}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* See Answer / Hide Answer toggle */}
            {!ar.isCorrect && (
              <div className="mt-3 pl-9">
                <button
                  onClick={() => toggleReveal(ar.questionId)}
                  className="text-xs font-semibold text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300 transition-colors"
                >
                  {revealedIds.has(ar.questionId)
                    ? t('admin.customSets.hideAnswer')
                    : t('admin.customSets.seeAnswer')}
                </button>
              </div>
            )}

            {/* Explanation — only when revealed */}
            {revealed && ar.explanation && (
              <p className="mt-3 pl-9 text-xs text-gray-500 dark:text-white/40 leading-relaxed border-t border-gray-100 dark:border-white/8 pt-3">
                <span className="font-semibold">{t('result.explanation')}: </span>
                {ar.explanation}
              </p>
            )}
          </div>
          );
        })}
      </div>
    </PageShell>
  );
};

export default CustomSetResultDetail;
