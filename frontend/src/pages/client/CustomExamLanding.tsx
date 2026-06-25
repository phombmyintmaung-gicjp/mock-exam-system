import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { clsx } from 'clsx';
import { PageShell } from '@/components/layout/PageShell';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { ClipboardCheckIcon, ClockIcon, BoltIcon } from '@/components/ui/Icons';
import { getCustomSetBySlug, startCustomExamSession, getMyCustomExamHistory } from '@/services/customSetService';
import { useExamSessionStore } from '@/store/examSessionStore';
import type { CustomExamLandingInfo, MyCustomExamAttempt } from '@/types/customSet';

const CustomExamLanding = () => {
  const { t } = useTranslation();
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const setSession = useExamSessionStore((s) => s.setSession);

  const [info, setInfo] = useState<CustomExamLandingInfo | null>(null);
  const [history, setHistory] = useState<MyCustomExamAttempt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!slug) return;
    Promise.all([
      getCustomSetBySlug(slug),
      getMyCustomExamHistory(slug),
    ])
      .then(([landingInfo, attempts]) => {
        setInfo(landingInfo);
        setHistory(attempts);
      })
      .catch(() => setError(t('common.error')))
      .finally(() => setIsLoading(false));
  }, [slug, t]);

  const handleStart = async () => {
    if (!slug || !info) return;
    setIsStarting(true);
    setError('');
    try {
      const { session, questions } = await startCustomExamSession(slug);
      setSession({
        sessionId: session.id,
        mode: 'exam',
        questions,
        currentIndex: 0,
        answers: {},
        flagged: new Set(),
        secondsRemaining: session.timeLimitSeconds,
      });
      navigate(`/exam/custom/session`, { state: { slug, setName: session.setName } });
    } catch {
      setError(t('common.error'));
      setIsStarting(false);
    }
  };

  const formatTime = (seconds: number) => {
    if (seconds === 0) return t('customExam.landing.noTimeLimit');
    const m = Math.round(seconds / 60);
    return t('customExam.landing.timeLimit', { minutes: m });
  };

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

  if (error || !info) {
    return (
      <PageShell>
        <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4">
          <p className="text-sm text-rose-600 dark:text-rose-400">{error || t('common.error')}</p>
          <button
            onClick={() => navigate('/exam/select')}
            className="text-sm font-medium text-amber-600 hover:underline dark:text-amber-400"
          >
            {t('exam.backToSelect')}
          </button>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="mx-auto max-w-lg">
        {/* Main card */}
        <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 p-8 shadow-sm">
          {/* Icon + title */}
          <div className="mb-6 flex flex-col items-center text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-md shadow-amber-200/50 dark:shadow-amber-500/20">
              <ClipboardCheckIcon className="h-7 w-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{info.name}</h1>
            {info.description && (
              <p className="mt-2 text-sm text-gray-500 dark:text-white/50">{info.description}</p>
            )}
          </div>

          {/* Stats */}
          <div className="mb-8 grid grid-cols-3 gap-4">
            <div className="flex flex-col items-center rounded-xl bg-gray-50 dark:bg-white/5 p-4">
              <ClipboardCheckIcon className="mb-1.5 h-5 w-5 text-amber-500" />
              <span className="text-lg font-bold text-gray-900 dark:text-white">{info.questionCount}</span>
              <span className="text-xs text-gray-400 dark:text-white/35">{t('customExam.landing.questions')}</span>
            </div>
            <div className="flex flex-col items-center rounded-xl bg-gray-50 dark:bg-white/5 p-4">
              <ClockIcon className="mb-1.5 h-5 w-5 text-amber-500" />
              <span className="text-lg font-bold text-gray-900 dark:text-white">
                {info.timeLimitSeconds === 0 ? '∞' : Math.round(info.timeLimitSeconds / 60)}
              </span>
              <span className="text-xs text-gray-400 dark:text-white/35">
                {info.timeLimitSeconds === 0 ? t('customExam.landing.noTimeLimit') : t('customExam.landing.minutes')}
              </span>
            </div>
            <div className="flex flex-col items-center rounded-xl bg-gray-50 dark:bg-white/5 p-4">
              <BoltIcon className="mb-1.5 h-5 w-5 text-amber-500" />
              <span className="text-lg font-bold text-gray-900 dark:text-white">{info.passingScore}%</span>
              <span className="text-xs text-gray-400 dark:text-white/35">{t('customExam.landing.passingLabel')}</span>
            </div>
          </div>

          {error && (
            <p className="mb-4 rounded-lg bg-rose-50 dark:bg-rose-500/10 px-4 py-2.5 text-sm text-rose-600 dark:text-rose-400">
              {error}
            </p>
          )}

          {info.questionCount === 0 ? (
            <p className="text-center text-sm text-gray-400 dark:text-white/30">
              {t('customExam.landing.noQuestionsYet')}
            </p>
          ) : (
            <Button
              label={isStarting ? t('common.loading') : t('customExam.landing.start')}
              disabled={isStarting}
              onClick={handleStart}
              className="w-full justify-center"
            />
          )}
        </div>

        <p className="mt-4 text-center text-xs text-gray-400 dark:text-white/30">
          {formatTime(info.timeLimitSeconds)} · {t('customExam.landing.passingScore', { score: info.passingScore })}
        </p>

        {/* Past attempts */}
        {history.length > 0 && (
          <div className="mt-8">
            <div className="mb-3 flex items-center gap-2">
              <ClockIcon className="h-4 w-4 text-gray-400 dark:text-white/30" />
              <h2 className="text-sm font-semibold text-gray-600 dark:text-white/60">
                {t('customExam.landing.pastAttempts')}
              </h2>
            </div>
            <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5">
              {history.map((attempt, idx) => {
                const pct = Math.round((attempt.score / attempt.totalQuestions) * 100);
                const isPassed = attempt.status === 'pass';
                return (
                  <div
                    key={attempt.id}
                    className={clsx(
                      'flex items-center gap-4 px-5 py-3.5',
                      idx !== 0 && 'border-t border-gray-100 dark:border-white/8',
                    )}
                  >
                    <span className="w-5 shrink-0 text-center text-xs font-semibold text-gray-300 dark:text-white/20">
                      {idx + 1}
                    </span>
                    <span
                      className={clsx(
                        'shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold',
                        isPassed
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300'
                          : 'bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-300',
                      )}
                    >
                      {isPassed ? t('result.pass') : t('result.fail')}
                    </span>
                    <span className="min-w-0 flex-1 text-sm font-medium text-gray-800 dark:text-white/80">
                      {attempt.score} / {attempt.totalQuestions}
                      <span className="ml-1.5 text-xs text-gray-400 dark:text-white/30">({pct}%)</span>
                    </span>
                    <span className="shrink-0 text-xs text-gray-400 dark:text-white/30">
                      {fmt(attempt.completedAt)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </PageShell>
  );
};

export default CustomExamLanding;
