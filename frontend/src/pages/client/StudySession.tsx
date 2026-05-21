import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { clsx } from 'clsx';
import { PageShell } from '@/components/layout/PageShell';
import { ProgressBar } from '@/components/shared/ProgressBar';
import { QuestionCard } from '@/components/shared/QuestionCard';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { useExamSessionStore } from '@/store/examSessionStore';
import { submitExam } from '@/services/examService';

const StudySession = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const session      = useExamSessionStore((s) => s.session);
  const setAnswer    = useExamSessionStore((s) => s.setAnswer);
  const nextQuestion = useExamSessionStore((s) => s.nextQuestion);
  const prevQuestion = useExamSessionStore((s) => s.prevQuestion);
  const resetSession = useExamSessionStore((s) => s.resetSession);

  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    if (!session) navigate('/exam/select', { replace: true });
  }, [session, navigate]);

  // Reset revealed state when question changes
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
            <h1 className="text-xl font-bold text-gray-900">{t('exam.studyModeTitle')}</h1>
            <span className="text-sm text-gray-500">
              {t('exam.questionOf', { current: session.currentIndex + 1, total: session.questions.length })}
            </span>
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
                    'rounded-lg border px-4 py-2.5 text-sm font-medium',
                    isCorrect ? 'border-green-400 bg-green-50 text-green-800' : 'border-red-400 bg-red-50 text-red-700',
                  )}
                >
                  {isCorrect ? `✓ ${t('result.correct')}: ` : `✗ ${t('result.incorrect')}: `}{c.text}
                </div>
              );
            })}
            {currentQ.explanation && (
              <div className="rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-gray-700">
                <span className="mr-1 font-semibold text-blue-600">{t('result.review.explanation')}:</span>
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
