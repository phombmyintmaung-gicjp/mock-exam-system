import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { PageShell } from '@/components/layout/PageShell';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { ClipboardCheckIcon, ClockIcon, BoltIcon } from '@/components/ui/Icons';
import { getCustomSetBySlug, startCustomExamSession } from '@/services/customSetService';
import { useExamSessionStore } from '@/store/examSessionStore';
import type { CustomExamLandingInfo } from '@/types/customSet';

const CustomExamLanding = () => {
  const { t } = useTranslation();
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const setSession = useExamSessionStore((s) => s.setSession);

  const [info, setInfo] = useState<CustomExamLandingInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!slug) return;
    getCustomSetBySlug(slug)
      .then(setInfo)
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

        <p className="mt-6 text-center text-xs text-gray-400 dark:text-white/30">
          {formatTime(info.timeLimitSeconds)} · {t('customExam.landing.passingScore', { score: info.passingScore })}
        </p>
      </div>
    </PageShell>
  );
};

export default CustomExamLanding;
