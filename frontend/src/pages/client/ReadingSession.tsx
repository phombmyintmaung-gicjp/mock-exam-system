import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { clsx } from 'clsx';
import { PageShell } from '@/components/layout/PageShell';
import { Timer } from '@/components/shared/Timer';
import { ProgressBar } from '@/components/shared/ProgressBar';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Spinner } from '@/components/ui/Spinner';
import { useExamSessionStore } from '@/store/examSessionStore';
import { useExamGuardStore } from '@/store/examGuardStore';
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

  const activateGuard   = useExamGuardStore((s) => s.activate);
  const deactivateGuard = useExamGuardStore((s) => s.deactivate);
  const pendingPath     = useExamGuardStore((s) => s.pendingPath);
  const setPendingPath  = useExamGuardStore((s) => s.setPendingPath);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const isFinishing = useRef(false);

  const isStudy = session?.mode === 'study';

  useEffect(() => {
    if (!session && !isFinishing.current) navigate('/exam/select', { replace: true });
  }, [session, navigate]);

  useEffect(() => { setRevealed(false); }, [session?.currentIndex]);

  useElapsedTimer(isStudy ? (session?.currentIndex ?? 0) : -1);

  // Activate exam guard only in exam mode
  useEffect(() => {
    if (isStudy) return;
    activateGuard();
    return () => { deactivateGuard(); };
  }, [isStudy, activateGuard, deactivateGuard]);

  // Open exit modal when sidebar intercepts a navigation attempt
  useEffect(() => {
    if (pendingPath !== null) setShowExitModal(true);
  }, [pendingPath]);

  // Browser tab close / refresh (exam mode only)
  useEffect(() => {
    if (isStudy) return;
    const handler = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isStudy]);

  // Browser back button — push a sentinel so popstate fires instead of leaving (exam mode only)
  useEffect(() => {
    if (isStudy) return;
    window.history.pushState(null, '', window.location.href);
    const handler = () => {
      window.history.pushState(null, '', window.location.href);
      setShowExitModal(true);
    };
    window.addEventListener('popstate', handler);
    return () => window.removeEventListener('popstate', handler);
  }, [isStudy]);

  const handleConfirmExit = () => {
    isFinishing.current = true;
    resetSession();
    deactivateGuard();
    setShowExitModal(false);
    navigate(pendingPath ?? '/exam/select');
    setPendingPath(null);
  };

  const handleCancelExit = () => {
    setShowExitModal(false);
    setPendingPath(null);
  };

  const handleSubmit = async () => {
    if (!session?.sessionId || isSubmitting) return;
    setIsSubmitting(true);
    const questionIds = session.questions.map((q) => q.id);
    try {
      isFinishing.current = true;
      const result = await submitExam(session.sessionId, session.answers, questionIds);
      resetSession();
      navigate(`/exam/results/${result.id}`);
    } catch {
      isFinishing.current = false;
      setIsSubmitting(false);
    }
  };

  // Pass -1 in study mode to disable the timer (0 would fire expire immediately)
  useTimer(isStudy ? -1 : (session?.secondsRemaining ?? 0), () => { handleSubmit(); });

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
    <>
      <PageShell>
        {/* Header bar */}
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="rounded-full border border-purple-400/30 bg-purple-500/20 px-3 py-1 text-xs font-semibold text-purple-300">
              {t('exam.jlpt.bunpoKaido')}
            </span>
            <span className="text-sm text-slate-500 dark:text-white/50">
              {t('exam.questionOf', { current: session.currentIndex + 1, total: session.questions.length })}
            </span>
          </div>
          <div className="flex items-center gap-3">
            {isStudy ? (
              <Timer seconds={session.questionElapsedSeconds} mode="elapsed" />
            ) : (
              <>
                {session.secondsRemaining > 0 && (
                  <Timer seconds={session.secondsRemaining} mode="countdown" />
                )}
                <button
                  onClick={() => setShowExitModal(true)}
                  className="flex items-center gap-1.5 rounded-xl border border-rose-300 dark:border-rose-500/30 bg-rose-50 dark:bg-rose-500/10 px-3 py-1.5 text-sm font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-500/20 transition-all"
                >
                  ✕ {t('exam.exitConfirmButton')}
                </button>
              </>
            )}
          </div>
        </div>

        <ProgressBar current={session.currentIndex + 1} total={session.questions.length} />

        {/* Split layout */}
        <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:gap-6">

          {/* Passage panel */}
          <div className="lg:w-1/2">
            <div className="sticky top-20 glass-card rounded-2xl p-5 shadow-xl shadow-black/8 dark:shadow-black/20">
              {passage ? (
                <>
                  <h2 className="mb-3 text-base font-semibold text-slate-800 dark:text-white/90">{passage.title}</h2>
                  <div className="max-h-[60vh] overflow-y-auto text-sm leading-7 text-slate-600 dark:text-white/70 whitespace-pre-wrap scrollbar-thin">
                    {passage.content}
                  </div>
                </>
              ) : (
                <p className="text-sm text-slate-300 dark:text-white/35">{t('common.noData')}</p>
              )}
            </div>
          </div>

          {/* Question panel */}
          <div className="lg:w-1/2">
            {currentQ && (
              <div className="glass-card rounded-2xl p-5 shadow-xl shadow-black/8 dark:shadow-black/20">
                <p className="mb-4 text-base font-medium text-slate-800 dark:text-white/90">{currentQ.text}</p>

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
                          'w-full rounded-xl border px-4 py-3 text-left text-sm transition-all',
                          showResult && isCorrect
                            ? 'border-emerald-400/40 bg-emerald-500/20 font-semibold text-emerald-800 dark:text-emerald-300'
                            : showResult && isSelected && !isCorrect
                              ? 'border-rose-400/40 bg-rose-500/15 text-rose-800 dark:text-rose-300'
                              : isSelected
                                ? 'border-indigo-400/50 bg-indigo-500/20 text-white'
                                : 'border-slate-200 dark:border-white/10 bg-black/5 dark:bg-white/5 text-slate-600 dark:text-white/70 hover:border-slate-300 dark:hover:border-white/25 hover:bg-black/5 dark:hover:bg-white/10 hover:text-slate-800 dark:hover:text-white/90',
                        )}
                      >
                        {choice.text}
                      </button>
                    );
                  })}
                </div>

                {isStudy && revealed && currentQ.explanation && (
                  <div className="mt-4 rounded-xl border border-blue-400/25 bg-blue-500/10 px-4 py-3 text-sm text-blue-900 dark:text-blue-200">
                    <span className="mr-1 font-semibold text-blue-700 dark:text-blue-300">{t('result.review.explanation')}:</span>
                    {currentQ.explanation}
                  </div>
                )}
              </div>
            )}

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

      <Modal
        isOpen={showExitModal}
        title={t('exam.exitConfirmTitle')}
        onClose={handleCancelExit}
      >
        <p className="mb-6 text-slate-600 dark:text-white/75">{t('exam.exitConfirmMessage')}</p>
        <div className="flex justify-end gap-3">
          <Button label={t('common.cancel')} variant="secondary" onClick={handleCancelExit} />
          <Button label={t('exam.exitConfirmButton')} variant="danger" onClick={handleConfirmExit} />
        </div>
      </Modal>
    </>
  );
};

export default ReadingSession;
