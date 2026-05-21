import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { clsx } from 'clsx';
import { PageShell } from '@/components/layout/PageShell';
import { Timer } from '@/components/shared/Timer';
import { ProgressBar } from '@/components/shared/ProgressBar';
import { QuestionCard } from '@/components/shared/QuestionCard';
import { Button } from '@/components/ui/Button';
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

  useEffect(() => {
    if (!session) navigate('/exam/select', { replace: true });
  }, [session, navigate]);

  const handleSubmit = async () => {
    if (!session?.sessionId) return;
    const questionIds = session.questions.map((q) => q.id);
    try {
      const result = await submitExam(session.sessionId, session.answers, questionIds);
      resetSession();
      navigate(`/exam/results/${result.id}`);
    } catch {
      // stay on page if submit fails
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
          <Button label={t('exam.submitExam')} variant="danger" onClick={handleSubmit} />
        </div>
      </div>
    </PageShell>
  );
};

export default ExamSession;
