import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { clsx } from 'clsx';
import { PageShell } from '@/components/layout/PageShell';
import { Timer } from '@/components/shared/Timer';
import { ProgressBar } from '@/components/shared/ProgressBar';
import { QuestionCard } from '@/components/shared/QuestionCard';
import { ExamSecurityNotice } from '@/components/shared/ExamSecurityNotice';
import { ExamViolationModal } from '@/components/shared/ExamViolationModal';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Spinner } from '@/components/ui/Spinner';
import { FlagIcon, XIcon, ChevronLeftIcon, ChevronRightIcon, TriangleAlertIcon } from '@/components/ui/Icons';
import { useExamSessionStore } from '@/store/examSessionStore';
import { useExamGuardStore } from '@/store/examGuardStore';
import { useExamSecurity } from '@/hooks/useExamSecurity';
import useTimer from '@/hooks/useTimer';
import { submitExam } from '@/services/examService';
import { EXAM_SECURITY_THRESHOLD } from '@/constants';

const SECURITY_THRESHOLD = EXAM_SECURITY_THRESHOLD;

const ExamSession = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const session        = useExamSessionStore((s) => s.session);
  const setAnswer      = useExamSessionStore((s) => s.setAnswer);
  const toggleFlag     = useExamSessionStore((s) => s.toggleFlag);
  const nextQuestion   = useExamSessionStore((s) => s.nextQuestion);
  const prevQuestion   = useExamSessionStore((s) => s.prevQuestion);
  const resetSession   = useExamSessionStore((s) => s.resetSession);

  const activateGuard   = useExamGuardStore((s) => s.activate);
  const deactivateGuard = useExamGuardStore((s) => s.deactivate);
  const pendingPath     = useExamGuardStore((s) => s.pendingPath);
  const setPendingPath  = useExamGuardStore((s) => s.setPendingPath);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [unansweredCount, setUnansweredCount] = useState(0);
  const [securityAcknowledged, setSecurityAcknowledged] = useState(false);
  const isFinishing = useRef(false);

  useEffect(() => {
    activateGuard();
    return () => { deactivateGuard(); };
  }, [activateGuard, deactivateGuard]);

  // Open modal when Sidebar intercepted a navigation attempt
  useEffect(() => {
    if (pendingPath !== null) setShowExitModal(true);
  }, [pendingPath]);

  useEffect(() => {
    if (!session && !isFinishing.current) navigate('/exam/select', { replace: true });
  }, [session, navigate]);

  // Browser tab close / refresh
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, []);

  // Browser back button — push a sentinel so popstate fires instead of leaving
  useEffect(() => {
    window.history.pushState(null, '', window.location.href);
    const handler = () => {
      window.history.pushState(null, '', window.location.href);
      setShowExitModal(true);
    };
    window.addEventListener('popstate', handler);
    return () => window.removeEventListener('popstate', handler);
  }, []);

  const handleConfirmExit = async () => {
    if (!session?.sessionId || isSubmitting) return;
    setShowExitModal(false);
    setIsSubmitting(true);
    const questionIds = session.questions.map((q) => q.id);
    try {
      isFinishing.current = true;
      const result = await submitExam(session.sessionId, session.answers, questionIds);
      resetSession();
      deactivateGuard();
      setPendingPath(null);
      navigate(`/exam/results/${result.id}`);
    } catch {
      isFinishing.current = false;
      setIsSubmitting(false);
    }
  };

  const handleCancelExit = () => {
    setShowExitModal(false);
    setPendingPath(null);
  };

  const handleSubmit = () => {
    if (!session || isSubmitting) return;
    const unanswered = session.questions.filter((q) => !(q.id in session.answers)).length;
    setUnansweredCount(unanswered);
    setShowSubmitModal(true);
  };

  const handleSubmitConfirmed = useCallback(async () => {
    if (!session?.sessionId || isSubmitting) return;
    setShowSubmitModal(false);
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
  }, [session, isSubmitting, resetSession, navigate]);

  useTimer(session?.secondsRemaining ?? 0, () => { handleSubmitConfirmed(); });

  const {
    violationCount,
    showWarning: showSecurityWarning,
    lastViolationType,
    dismissWarning: dismissSecurityWarning,
  } = useExamSecurity({
    enabled: securityAcknowledged && !!session,
    threshold: SECURITY_THRESHOLD,
    onAutoSubmit: handleSubmitConfirmed,
  });

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
              <span className="text-sm font-medium text-slate-500 dark:text-white/55">
                {t('exam.questionOf', { current: session.currentIndex + 1, total: session.questions.length })}
              </span>
              <div className="flex items-center gap-3">
                {session.secondsRemaining > 0 && (
                  <Timer seconds={session.secondsRemaining} mode="countdown" />
                )}
                <button
                  onClick={() => currentQ && toggleFlag(currentQ.id)}
                  className={clsx(
                    'group flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm font-medium transition-all',
                    isFlagged
                      ? 'bg-orange-500/20 text-orange-300 border border-orange-400/30'
                      : 'border border-slate-200 dark:border-white/15 bg-black/5 dark:bg-white/8 text-slate-500 dark:text-white/50 hover:bg-black/8 dark:hover:bg-white/15 hover:text-slate-700 dark:hover:text-white/80',
                  )}
                >
                  <FlagIcon className={clsx('h-4 w-4 transition-transform duration-150', isFlagged ? 'scale-110' : 'group-hover:scale-125')} />
                  {t('exam.flag')}
                </button>
                <button
                  onClick={() => setShowExitModal(true)}
                  className="group flex items-center gap-1.5 rounded-xl border border-rose-300 dark:border-rose-500/30 bg-rose-50 dark:bg-rose-500/10 px-3 py-1.5 text-sm font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-500/20 transition-all"
                >
                  <XIcon className="h-4 w-4 transition-transform duration-200 group-hover:rotate-90" />
                  {t('exam.exitConfirmButton')}
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
            <Button label={t('exam.prev')} variant="secondary" disabled={isFirst} onClick={prevQuestion}
              leftIcon={<ChevronLeftIcon className="h-4 w-4 transition-transform duration-150 group-hover:-translate-x-0.5" />}
            />
            <Button label={t('exam.next')} disabled={isLast} onClick={nextQuestion}
              rightIcon={<ChevronRightIcon className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-0.5" />}
            />
          </div>

          <div className="mt-4 flex justify-center">
            <Button label={isSubmitting ? t('common.saving') : t('exam.submitExam')} variant="danger" disabled={isSubmitting} onClick={handleSubmit} />
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
          <Button label={isSubmitting ? t('common.saving') : t('exam.exitConfirmButton')} variant="danger" disabled={isSubmitting} onClick={handleConfirmExit} />
        </div>
      </Modal>

      <Modal
        isOpen={showSubmitModal}
        title={unansweredCount > 0 ? t('exam.unansweredWarningTitle') : t('exam.submitConfirmTitle')}
        onClose={() => setShowSubmitModal(false)}
      >
        {unansweredCount > 0 ? (
          <>
            <div className="mb-5 flex items-start gap-3 rounded-xl border border-amber-300 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/10 p-4">
              <TriangleAlertIcon className="mt-0.5 h-5 w-5 shrink-0 animate-pulse text-amber-600 dark:text-amber-400" />
              <p className="text-sm text-amber-800 dark:text-amber-200">
                {t('exam.unansweredWarningMessage_other', { count: unansweredCount })}
              </p>
            </div>
            <div className="flex justify-end gap-3">
              <Button label={t('exam.goBack')} variant="secondary" onClick={() => setShowSubmitModal(false)} />
              <Button label={t('exam.submitAnyway')} variant="danger" onClick={handleSubmitConfirmed} />
            </div>
          </>
        ) : (
          <>
            <p className="mb-6 text-slate-600 dark:text-white/75">{t('exam.submitConfirmMessage')}</p>
            <div className="flex justify-end gap-3">
              <Button label={t('common.cancel')} variant="secondary" onClick={() => setShowSubmitModal(false)} />
              <Button label={t('exam.submitConfirmButton')} onClick={handleSubmitConfirmed} />
            </div>
          </>
        )}
      </Modal>

      {session && !securityAcknowledged && (
        <ExamSecurityNotice onAcknowledge={() => setSecurityAcknowledged(true)} onClose={() => { isFinishing.current = true; deactivateGuard(); resetSession(); navigate('/exam/select'); }} />
      )}

      <ExamViolationModal
        isOpen={showSecurityWarning}
        violationType={lastViolationType}
        violationCount={violationCount}
        threshold={SECURITY_THRESHOLD}
        onDismiss={dismissSecurityWarning}
      />
    </>
  );
};

export default ExamSession;
