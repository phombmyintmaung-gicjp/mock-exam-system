import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { clsx } from 'clsx';
import { PageShell } from '@/components/layout/PageShell';
import { Timer } from '@/components/shared/Timer';
import { ProgressBar } from '@/components/shared/ProgressBar';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { useExamSessionStore } from '@/store/examSessionStore';
import useTimer from '@/hooks/useTimer';
import useElapsedTimer from '@/hooks/useElapsedTimer';
import { submitExam } from '@/services/examService';
import type { Passage } from '@/types/exam';

const ReadingSession = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const session      = useExamSessionStore((s) => s.session);
  const setAnswer    = useExamSessionStore((s) => s.setAnswer);
  const nextQuestion = useExamSessionStore((s) => s.nextQuestion);
  const prevQuestion = useExamSessionStore((s) => s.prevQuestion);
  const resetSession = useExamSessionStore((s) => s.resetSession);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [revealed, setRevealed] = useState(false);

  const isStudy = session?.mode === 'study';

  useEffect(() => {
    if (!session) navigate('/exam/select', { replace: true });
  }, [session, navigate]);

  useEffect(() => { setRevealed(false); }, [session?.currentIndex]);

  useElapsedTimer(isStudy ? (session?.currentIndex ?? 0) : -1);

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

  useTimer(isStudy ? 0 : (session?.secondsRemaining ?? 0), () => { handleSubmit(); });

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
  const isFirst        = session.currentIndex === 0;
  const isLast         = session.currentIndex === session.questions.length - 1;
  const passage: Passage | undefined = currentQ?.passage;

  const handleSelect = (choiceId: number) => {
    if (!currentQ) return;
    if (isStudy && revealed) return;
    setAnswer(currentQ.id, choiceId);
    if (isStudy) setRevealed(true);
  };

  return (
    <PageShell>
      {/* Header bar */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700">
            {t('exam.jlpt.reading')}
          </span>
          <span className="text-sm text-slate-500">
            {t('exam.questionOf', { current: session.currentIndex + 1, total: session.questions.length })}
          </span>
        </div>
        <div className="flex items-center gap-3">
          {isStudy ? (
            <Timer seconds={session.questionElapsedSeconds} mode="elapsed" />
          ) : (
            session.secondsRemaining > 0 && (
              <Timer seconds={session.secondsRemaining} mode="countdown" />
            )
          )}
        </div>
      </div>

      <ProgressBar current={session.currentIndex + 1} total={session.questions.length} />

      {/* Split layout */}
      <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:gap-6">

        {/* Passage panel */}
        <div className="lg:w-1/2">
          <div className="sticky top-20 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            {passage ? (
              <>
                <h2 className="mb-3 text-base font-semibold text-slate-800">{passage.title}</h2>
                <div className="max-h-[60vh] overflow-y-auto text-sm leading-7 text-slate-700 whitespace-pre-wrap">
                  {passage.content}
                </div>
              </>
            ) : (
              <p className="text-sm text-slate-400">{t('common.noData')}</p>
            )}
          </div>
        </div>

        {/* Question panel */}
        <div className="lg:w-1/2">
          {currentQ && (
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="mb-4 text-base font-medium text-slate-900">{currentQ.text}</p>

              <div className="space-y-2">
                {currentQ.choices.map((choice) => {
                  const isSelected = choice.id === selectedChoice;
                  const showResult = isStudy && revealed;
                  const isCorrect  = choice.isCorrect === true;

                  return (
                    <button
                      key={choice.id}
                      onClick={() => handleSelect(choice.id)}
                      disabled={isStudy && revealed}
                      className={clsx(
                        'w-full rounded-lg border px-4 py-3 text-left text-sm transition-all',
                        showResult && isCorrect
                          ? 'border-green-400 bg-green-50 font-semibold text-green-800'
                          : showResult && isSelected && !isCorrect
                            ? 'border-red-400 bg-red-50 text-red-700'
                            : isSelected
                              ? 'border-indigo-500 bg-indigo-50 text-indigo-800'
                              : 'border-slate-200 bg-white text-slate-700 hover:border-indigo-300 hover:bg-indigo-50',
                      )}
                    >
                      {choice.text}
                    </button>
                  );
                })}
              </div>

              {/* Study mode: explanation */}
              {isStudy && revealed && currentQ.explanation && (
                <div className="mt-4 rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-slate-700">
                  <span className="mr-1 font-semibold text-blue-600">{t('result.review.explanation')}:</span>
                  {currentQ.explanation}
                </div>
              )}
            </div>
          )}

          {/* Navigation */}
          <div className="mt-4 flex justify-between gap-3">
            <Button label={t('exam.prev')} variant="secondary" disabled={isFirst} onClick={prevQuestion} />
            {isLast ? (
              <Button
                label={isSubmitting ? t('common.saving') : t('exam.submitExam')}
                variant="danger"
                disabled={isSubmitting || (isStudy && !revealed)}
                onClick={handleSubmit}
              />
            ) : (
              <Button
                label={t('exam.next')}
                disabled={isStudy && !revealed}
                onClick={nextQuestion}
              />
            )}
          </div>
        </div>
      </div>
    </PageShell>
  );
};

export default ReadingSession;
