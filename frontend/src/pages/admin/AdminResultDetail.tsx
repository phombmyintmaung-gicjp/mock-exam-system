import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { clsx } from 'clsx';
import { PageShell } from '@/components/layout/PageShell';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { ChevronLeftIcon, TriangleAlertIcon } from '@/components/ui/Icons';
import { getAdminResultDetail } from '@/services/resultService';
import type { ExamResult } from '@/types/result';

const AdminResultDetail = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const [result, setResult] = useState<ExamResult | null>(null);
  const [userName, setUserName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    getAdminResultDetail(Number(id))
      .then(({ result: r, userName: n }) => {
        setResult(r);
        setUserName(n);
      })
      .catch(() => setError(true))
      .finally(() => setIsLoading(false));
  }, [id]);

  const fmt = (iso: string) =>
    `${new Date(iso).toLocaleDateString()} ${new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}`;

  if (isLoading) {
    return (
      <PageShell>
        <div className="flex min-h-[40vh] items-center justify-center">
          <Spinner size="lg" />
        </div>
      </PageShell>
    );
  }

  if (error || !result) {
    return (
      <PageShell>
        <p className="text-sm text-slate-400 dark:text-white/30">{t('common.error')}</p>
      </PageShell>
    );
  }

  const pct = result.totalQuestions > 0
    ? Math.round((result.score / result.totalQuestions) * 100)
    : 0;

  return (
    <PageShell>
      <div className="mb-6">
        <Link
          to="/admin/results"
          className="mb-3 inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-600 dark:text-white/40 dark:hover:text-white/70 transition-colors"
        >
          <ChevronLeftIcon className="h-3.5 w-3.5" />
          {t('admin.results.backToList')}
        </Link>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t('admin.results.detailTitle')}</h1>
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
      <div className="mb-6 glass-card rounded-2xl shadow-xl shadow-black/8 dark:shadow-black/20 p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <p className="text-lg font-semibold text-slate-800 dark:text-white">{userName || '—'}</p>
            <p className="text-sm text-slate-500 dark:text-white/50">{result.category}</p>
            <p className="text-xs text-slate-400 dark:text-white/35">{result.completedAt ? fmt(result.completedAt) : '—'}</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <p className={clsx(
                'text-4xl font-bold',
                result.status === 'pass' ? 'text-emerald-500' : 'text-rose-500',
              )}>
                {pct}%
              </p>
              <p className="mt-0.5 text-xs text-slate-400 dark:text-white/40">
                {result.score} / {result.totalQuestions}
              </p>
            </div>
            <Badge
              label={t(result.status === 'pass' ? 'result.pass' : 'result.fail')}
              variant={result.status}
            />
          </div>
        </div>
      </div>

      {/* Answer review */}
      <div className="space-y-4">
        {result.answers.map((answer, idx) => {
          const unanswered = answer.selectedChoiceId === null;
          return (
          <div
            key={answer.questionId}
            className="glass-card rounded-2xl shadow-sm shadow-black/5 dark:shadow-black/15 p-5"
          >
            <div className="mb-3 flex items-start gap-3">
              <span className={clsx(
                'mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold',
                unanswered
                  ? 'bg-slate-100 text-slate-500 dark:bg-white/10 dark:text-white/40'
                  : answer.isCorrect
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300'
                  : 'bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-300',
              )}>
                {idx + 1}
              </span>
              <p className="text-sm font-medium text-slate-800 dark:text-white/90">{answer.questionText}</p>
            </div>

            <div className="ml-9 space-y-1.5">
              {answer.choices.map((choice) => {
                const isSelected = choice.id === answer.selectedChoiceId;
                const isCorrect = choice.id === answer.correctChoiceId;
                return (
                  <div
                    key={choice.id}
                    className={clsx(
                      'rounded-lg px-3 py-2 text-sm',
                      isCorrect && isSelected
                        ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-300 dark:bg-emerald-500/15 dark:text-emerald-300 dark:ring-emerald-500/40'
                        : isCorrect
                        ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/30'
                        : isSelected
                        ? 'bg-rose-50 text-rose-700 ring-1 ring-rose-300 dark:bg-rose-500/15 dark:text-rose-300 dark:ring-rose-500/40'
                        : 'text-slate-500 dark:text-white/45',
                    )}
                  >
                    <span className="flex items-center justify-between gap-2">
                      {choice.text}
                      {isCorrect && (
                        <span className="shrink-0 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                          {t('result.correct')}
                        </span>
                      )}
                      {isSelected && !isCorrect && (
                        <span className="shrink-0 text-xs font-semibold text-rose-500 dark:text-rose-400">
                          {t('result.incorrect')}
                        </span>
                      )}
                    </span>
                  </div>
                );
              })}
            </div>

            {unanswered && (
              <p className="ml-9 mt-2 text-xs italic text-slate-400 dark:text-white/30">
                {t('admin.customSets.unanswered')}
              </p>
            )}

            {answer.explanation && (
              <p className="ml-9 mt-3 text-xs text-slate-500 dark:text-white/45 leading-relaxed border-t border-slate-100 dark:border-white/8 pt-3">
                {answer.explanation}
              </p>
            )}
          </div>
          );
        })}
      </div>
    </PageShell>
  );
};

export default AdminResultDetail;
