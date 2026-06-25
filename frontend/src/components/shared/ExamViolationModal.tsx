import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import { TriangleAlertIcon } from '@/components/ui/Icons';
import type { ViolationType } from '@/hooks/useExamSecurity';

interface ExamViolationModalProps {
  isOpen: boolean;
  violationType: ViolationType | null;
  violationCount: number;
  threshold: number;
  onDismiss: () => void;
}

export function ExamViolationModal({
  isOpen,
  violationType,
  violationCount,
  threshold,
  onDismiss,
}: ExamViolationModalProps) {
  const { t } = useTranslation();
  const isFinal = violationCount >= threshold;

  const [countdown, setCountdown] = useState(4);

  useEffect(() => {
    if (!isOpen || !isFinal) return;
    setCountdown(4);
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) { clearInterval(interval); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen, isFinal]);

  if (!isOpen) return null;

  const messageKey = violationType === 'tab_switch'
    ? 'examSecurity.violation.tabSwitch'
    : 'examSecurity.violation.windowBlur';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm rounded-2xl border border-rose-200/50 bg-white shadow-2xl dark:border-rose-500/20 dark:bg-slate-900">

        <div className="flex flex-col items-center px-6 pt-6 text-center">
          <div className={`mb-3 flex h-14 w-14 items-center justify-center rounded-full ${isFinal ? 'bg-rose-100 dark:bg-rose-500/20' : 'bg-rose-50 dark:bg-rose-500/10'}`}>
            <TriangleAlertIcon className="h-8 w-8 text-rose-500" />
          </div>
          <h2 className="text-base font-bold text-slate-800 dark:text-white">
            {isFinal ? t('examSecurity.violation.finalTitle') : t('examSecurity.violation.title')}
          </h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-white/70">
            {t(messageKey)}
          </p>
        </div>

        {/* Violation dot indicator */}
        <div className="mx-6 my-4 rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 dark:border-rose-500/20 dark:bg-rose-500/10">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-rose-700 dark:text-rose-300">
              {t('examSecurity.violation.count', { count: violationCount, threshold })}
            </span>
            <div className="flex gap-1">
              {Array.from({ length: threshold }).map((_, i) => (
                <span
                  key={i}
                  className={`h-2 w-2 rounded-full transition-colors duration-300 ${
                    i < violationCount ? 'bg-rose-500' : 'bg-rose-200 dark:bg-rose-500/30'
                  }`}
                />
              ))}
            </div>
          </div>
          <p className="mt-1.5 text-xs text-rose-600 dark:text-rose-400">
            {isFinal
              ? t('examSecurity.violation.autoSubmitWarning', { remaining: 0 })
              : t('examSecurity.violation.autoSubmitWarning', { remaining: threshold - violationCount })}
          </p>
        </div>

        {/* Final state: countdown bar */}
        {isFinal && (
          <div className="px-6 pb-6 text-center">
            <p className="mb-3 text-sm font-semibold text-rose-600 dark:text-rose-400">
              {t('examSecurity.violation.autoSubmitting')}
            </p>
            <div className="relative h-2 w-full overflow-hidden rounded-full bg-rose-100 dark:bg-rose-500/20">
              <div
                className="absolute inset-y-0 left-0 rounded-full bg-rose-500 transition-all duration-1000 ease-linear"
                style={{ width: `${(countdown / 4) * 100}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-slate-400 dark:text-white/30">
              {countdown}s
            </p>
          </div>
        )}

        {/* Non-final: dismiss button */}
        {!isFinal && (
          <div className="px-6 pb-6">
            <Button
              label={t('examSecurity.violation.dismiss')}
              variant="danger"
              onClick={onDismiss}
              className="w-full"
            />
          </div>
        )}
      </div>
    </div>
  );
}
