import { useTranslation } from 'react-i18next';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { PageShell } from '@/components/layout/PageShell';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import useResults from '@/hooks/useResults';
import { exportResultPdf } from '@/services/resultService';
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

  const { result, isLoading, error } = useResults(resultId);

  if (isLoading) {
    return (
      <PageShell>
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="text-center">
            <Spinner size="lg" />
            <p className="mt-4 text-sm text-gray-500">{t('common.loading')}</p>
          </div>
        </div>
      </PageShell>
    );
  }

  if (error || !result) {
    return (
      <PageShell>
        <div className="flex min-h-[60vh] items-center justify-center">
          <p className="text-sm text-red-500">{t('common.error')}</p>
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
