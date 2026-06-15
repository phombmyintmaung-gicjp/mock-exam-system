import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { clsx } from 'clsx';
import { PageShell } from '@/components/layout/PageShell';
import { ProgressBar } from '@/components/shared/ProgressBar';
import { QuestionCard } from '@/components/shared/QuestionCard';
import { Timer } from '@/components/shared/Timer';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { useExamSessionStore } from '@/store/examSessionStore';
import useElapsedTimer from '@/hooks/useElapsedTimer';
import { submitExam } from '@/services/examService';

const StudySession = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const session               = useExamSessionStore((s) => s.session);
  const setAnswer             = useExamSessionStore((s) => s.setAnswer);
  const nextQuestion          = useExamSessionStore((s) => s.nextQuestion);
  const prevQuestion          = useExamSessionStore((s) => s.prevQuestion);
  const resetSession          = useExamSessionStore((s) => s.resetSession);

  const [revealed, setRevealed] = useState(false);

  useElapsedTimer(session?.currentIndex ?? 0);

  useEffect(() => {
    if (!session) navigate('/exam/select', { replace: true });
  }, [session, navigate]);

  useEffect(() => { setRevealed(false); }, [session?.currentIndex]);

  const handleSelect = (choiceId: number) => {
    if (!currentQ || revealed) return;
    setAnswer(currentQ.id, choiceId);
    setRevealed(true);
  };

  const handleFinish = async () => {
    if (!session?.sessionId) return;
    const questionIds = session.questions.map((q) => q.id);
    try {
      const result = await submitExam(session.sessionId, session.answers, questionIds);
      resetSession();
      navigate(`/exam/results/${result.id}`);
    } catch {
      // stay on page
    }
  };

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
  const isLast = session.currentIndex === session.questions.length - 1;

  return (
    <PageShell>
      <div className="mx-auto max-w-3xl">
        <div className="mb-6">
          <div className="mb-2 flex items-center justify-between">
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">{t('exam.studyModeTitle')}</h1>
            <div className="flex items-center gap-3">
              <Timer seconds={session.questionElapsedSeconds} mode="elapsed" />
              <span className="text-sm text-slate-500 dark:text-white/50">
                {t('exam.questionOf', { current: session.currentIndex + 1, total: session.questions.length })}
              </span>
            </div>
          </div>
          <ProgressBar current={session.currentIndex + 1} total={session.questions.length} />
        </div>

        {currentQ && (
          <QuestionCard
            question={currentQ}
            selectedChoiceId={selectedChoice}
            onSelect={handleSelect}
          />
        )}

        {revealed && currentQ && (
          <div className="mt-4 space-y-2">
            {currentQ.choices.map((c) => {
              const isCorrect = c.isCorrect;
              const isSelected = c.id === selectedChoice;
              if (!isCorrect && !isSelected) return null;
              return (
                <div
                  key={c.id}
                  className={clsx(
                    'rounded-xl border px-4 py-2.5 text-sm font-medium',
                    isCorrect
                      ? 'border-emerald-400/40 bg-emerald-500/15 text-emerald-300'
                      : 'border-rose-400/40 bg-rose-500/15 text-rose-300',
                  )}
                >
                  {isCorrect ? `✓ ${t('result.correct')}: ` : `✗ ${t('result.incorrect')}: `}{c.text}
                </div>
              );
            })}
            {currentQ.explanation && (
              <div className="rounded-xl border border-blue-400/25 bg-blue-500/10 px-4 py-3 text-sm text-blue-200">
                <span className="mr-1 font-semibold text-blue-300">{t('result.review.explanation')}:</span>
                {currentQ.explanation}
              </div>
            )}
          </div>
        )}

        <div className="mt-6 flex justify-between">
          <Button
            label={t('exam.prev')}
            variant="secondary"
            disabled={session.currentIndex === 0}
            onClick={prevQuestion}
          />
          {isLast ? (
            <Button label={t('exam.submitExam')} variant="danger" onClick={handleFinish} />
          ) : (
            <Button
              label={t('exam.next')}
              disabled={!revealed}
              onClick={nextQuestion}
            />
          )}
        </div>
      </div>
    </PageShell>
  );
};

export default StudySession;
