import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useBlocker } from 'react-router-dom';
import { clsx } from 'clsx';
import { PageShell } from '@/components/layout/PageShell';
import { Timer } from '@/components/shared/Timer';
import { ProgressBar } from '@/components/shared/ProgressBar';
import { QuestionCard } from '@/components/shared/QuestionCard';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Spinner } from '@/components/ui/Spinner';
import { useExamSessionStore } from '@/store/examSessionStore';
import useTimer from '@/hooks/useTimer';
import { submitExam } from '@/services/examService';

const ExamSession = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const session        = useExamSessionStore((s) => s.session);
  const setAnswer      = useExamSessionStore((s) => s.setAnswer);
  const toggleFlag     = useExamSessionStore((s) => s.toggleFlag);
  const nextQuestion   = useExamSessionStore((s) => s.nextQuestion);
  const prevQuestion   = useExamSessionStore((s) => s.prevQuestion);
  const resetSession   = useExamSessionStore((s) => s.resetSession);

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!session) navigate('/exam/select', { replace: true });
  }, [session, navigate]);

  // Block in-app navigation while an exam is active
  const blocker = useBlocker(({ currentLocation, nextLocation }) =>
    !!session && currentLocation.pathname !== nextLocation.pathname,
  );

  const handleConfirmExit = () => {
    resetSession();
    blocker.proceed?.();
  };

  const handleCancelExit = () => {
    blocker.reset?.();
  };

  const handleSubmit = async () => {
    if (!session?.sessionId || isSubmitting) return;
    setIsSubmitting(true);
    const questionIds = session.questions.map((q) => q.id);
    try {
      const result = await submitExam(session.sessionId, session.answers, questionIds);
      resetSession();
      navigate(`/exam/results/${result.id}`);
    } catch {
      setIsSubmitting(false);
    }
  };

  useTimer(session?.secondsRemaining ?? 0, () => { handleSubmit(); });

  if (!session) {
    return (
      <PageShell>
        <div className="flex min-h-[60vh] items-center justify-center">
          <Spinner size="lg" />
        </div>
      </PageShell>
    );
  }

  const currentQ       = session.questions[session.currentIndex];
  const selectedChoice = currentQ ? session.answers[currentQ.id] : undefined;
  const isFlagged      = currentQ ? session.flagged.has(currentQ.id) : false;
  const isFirst        = session.currentIndex === 0;
  const isLast         = session.currentIndex === session.questions.length - 1;

  return (
    <>
      <PageShell>
        <div className="mx-auto max-w-3xl">
          <div className="mb-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">
                {t('exam.questionOf', { current: session.currentIndex + 1, total: session.questions.length })}
              </span>
              <div className="flex items-center gap-3">
                {session.secondsRemaining > 0 && (
                  <Timer secondsRemaining={session.secondsRemaining} />
                )}
                <button
                  onClick={() => currentQ && toggleFlag(currentQ.id)}
                  className={clsx(
                    'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium',
                    isFlagged
                      ? 'bg-orange-50 text-orange-600'
                      : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800',
                  )}
                >
                  🚩 {t('exam.flag')}
                </button>
              </div>
            </div>
            <ProgressBar current={session.currentIndex + 1} total={session.questions.length} />
          </div>

          {currentQ && (
            <QuestionCard
              question={currentQ}
              selectedChoiceId={selectedChoice}
              onSelect={(choiceId) => setAnswer(currentQ.id, choiceId)}
            />
          )}

          <div className="mt-6 flex justify-between gap-3">
            <Button label={t('exam.prev')} variant="secondary" disabled={isFirst} onClick={prevQuestion} />
            <Button label={t('exam.next')} disabled={isLast} onClick={nextQuestion} />
          </div>

          <div className="mt-4 flex justify-center">
            <Button label={isSubmitting ? t('common.saving') : t('exam.submitExam')} variant="danger" disabled={isSubmitting} onClick={handleSubmit} />
          </div>
        </div>
      </PageShell>

      <Modal
        isOpen={blocker.state === 'blocked'}
        title={t('exam.exitConfirmTitle')}
        onClose={handleCancelExit}
      >
        <p className="mb-6">{t('exam.exitConfirmMessage')}</p>
        <div className="flex justify-end gap-3">
          <Button label={t('common.cancel')} variant="secondary" onClick={handleCancelExit} />
          <Button label={t('exam.exitConfirmButton')} variant="danger" onClick={handleConfirmExit} />
        </div>
      </Modal>
    </>
  );
};

export default ExamSession;
