import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { PageShell } from '@/components/layout/PageShell';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import useResults from '@/hooks/useResults';
import { exportResultPdf } from '@/services/resultService';
import { getCombinedResult, type CombinedResult } from '@/services/examService';
import { useAuthStore } from '@/store/authStore';

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

const Results = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams<{ id: string }>();
  const resultId = Number(id);
  const userName = useAuthStore((s) => s.user?.name);

  const studyTotalSeconds: number | undefined = (location.state as { studyTotalSeconds?: number } | null)?.studyTotalSeconds;
  const studyQuestionCount: number | undefined = (location.state as { questionCount?: number } | null)?.questionCount;
  const linkedSessionId: number | undefined = (location.state as { linkedSessionId?: number } | null)?.linkedSessionId;

  const { result, isLoading, error } = useResults(resultId);

  const [combined, setCombined] = useState<CombinedResult | null>(null);
  useEffect(() => {
    if (!result) return;
    // Only attempt combined fetch when this result is part of a two-part JLPT exam.
    if (result.linkedSessionId || linkedSessionId) {
      getCombinedResult(resultId).then(setCombined).catch(() => {});
    }
  }, [result, resultId, linkedSessionId]);

  if (isLoading) {
    return (
      <PageShell>
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="text-center">
            <Spinner size="lg" />
            <p className="mt-4 text-sm text-gray-500 dark:text-white/50">{t('common.loading')}</p>
          </div>
        </div>
      </PageShell>
    );
  }

  if (error || !result) {
    return (
      <PageShell>
        <div className="flex min-h-[60vh] items-center justify-center">
          <p className="text-sm text-red-500 dark:text-red-400">{t('common.error')}</p>
        </div>
      </PageShell>
    );
  }

  const percentage = result.totalQuestions > 0
    ? Math.round((result.score / result.totalQuestions) * 100)
    : 0;

  return (
    <PageShell>
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('result.title')}</h1>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white px-6 py-10 shadow-sm text-center md:px-10 dark:border-white/10 dark:bg-white/5">
          <Badge label={t(result.status === 'pass' ? 'result.pass' : 'result.fail')} variant={result.status} />
          <p className="mt-4 text-6xl font-bold text-gray-900 dark:text-white">{result.score}</p>
          <p className="mt-1 text-sm text-gray-500 dark:text-white/50">{t('result.outOfCorrect', { total: result.totalQuestions })}</p>
          <p className="mt-2 text-xl font-semibold text-gray-700 dark:text-white/80">{t('result.scoreLabel')} {percentage}%</p>
          <p className="mt-1 text-sm text-gray-400 dark:text-white/40">{t('result.passingScore')} {result.passingScore}%</p>

          {combined && (
            <div className="mt-6 rounded-xl border border-indigo-200 bg-indigo-50 px-5 py-4 text-left dark:border-indigo-500/30 dark:bg-indigo-500/10">
              <p className="mb-3 text-sm font-bold text-indigo-700 dark:text-indigo-300">{t('result.combinedTitle')}</p>
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center">
                  <p className="text-xs text-indigo-500 dark:text-indigo-400">{t('result.combinedPart1')}</p>
                  <p className="mt-0.5 text-lg font-bold text-indigo-800 dark:text-indigo-200">
                    {combined.part1Score ?? '—'}<span className="text-sm font-normal">/{combined.part1Total ?? '—'}</span>
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-indigo-500 dark:text-indigo-400">{t('result.combinedPart2')}</p>
                  <p className="mt-0.5 text-lg font-bold text-indigo-800 dark:text-indigo-200">
                    {combined.part2Score ?? '—'}<span className="text-sm font-normal">/{combined.part2Total ?? '—'}</span>
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-indigo-500 dark:text-indigo-400">{t('result.combinedTotal')}</p>
                  <p className="mt-0.5 text-lg font-bold text-indigo-800 dark:text-indigo-200">
                    {combined.totalScore}<span className="text-sm font-normal">/{combined.totalQuestions}</span>
                  </p>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <Badge label={t(combined.status === 'pass' ? 'result.pass' : 'result.fail')} variant={combined.status} />
                <span className="text-sm font-semibold text-indigo-700 dark:text-indigo-300">{combined.percentage}%</span>
              </div>
            </div>
          )}

          {studyTotalSeconds !== undefined && studyQuestionCount !== undefined && (
            <div className="mt-6 grid grid-cols-2 gap-3 text-left">
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-white/10 dark:bg-white/5">
                <p className="text-xs text-slate-500 dark:text-white/40">{t('result.studyTotalTime')}</p>
                <p className="mt-1 text-lg font-bold text-slate-800 dark:text-white">{formatTime(studyTotalSeconds)}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-white/10 dark:bg-white/5">
                <p className="text-xs text-slate-500 dark:text-white/40">{t('result.studyAvgTime')}</p>
                <p className="mt-1 text-lg font-bold text-slate-800 dark:text-white">
                  {(studyTotalSeconds / studyQuestionCount).toFixed(2)}s
                </p>
              </div>
            </div>
          )}

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button
              label={t('result.reviewAnswers')}
              variant="secondary"
              onClick={() => navigate(`/exam/results/${resultId}/review`)}
            />
            <Button
              label={t('result.exportPdf')}
              variant="secondary"
              onClick={() => exportResultPdf(resultId, result?.category, userName)}
            />
            <Button
              label={t('result.viewHistory')}
              variant="secondary"
              onClick={() => navigate('/profile/history')}
            />
            <Button
              label={t('result.retake')}
              onClick={() => navigate('/exam/select')}
            />
          </div>
        </div>
      </div>
    </PageShell>
  );
};

export default Results;
