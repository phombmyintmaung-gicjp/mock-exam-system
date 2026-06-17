import { useState, useEffect, useRef, useCallback } from 'react';

export type ViolationType = 'tab_switch' | 'window_blur';

export interface SecurityViolation {
  type: ViolationType;
  timestamp: string;
}

interface UseExamSecurityOptions {
  enabled: boolean;
  threshold?: number;
  onAutoSubmit: () => void;
}

interface UseExamSecurityReturn {
  violations: SecurityViolation[];
  violationCount: number;
  showWarning: boolean;
  lastViolationType: ViolationType | null;
  dismissWarning: () => void;
}

const COOLDOWN_MS = 2000;
const FINAL_DELAY_MS = 4000;

export function useExamSecurity({
  enabled,
  threshold = 3,
  onAutoSubmit,
}: UseExamSecurityOptions): UseExamSecurityReturn {
  const [violations, setViolations] = useState<SecurityViolation[]>([]);
  const [violationCount, setViolationCount] = useState(0);
  const [showWarning, setShowWarning] = useState(false);
  const [lastViolationType, setLastViolationType] = useState<ViolationType | null>(null);

  const countRef = useRef(0);
  const isSubmittingRef = useRef(false);
  const blurTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastViolationTimeRef = useRef(0);
  const onAutoSubmitRef = useRef(onAutoSubmit);

  useEffect(() => { onAutoSubmitRef.current = onAutoSubmit; }, [onAutoSubmit]);

  const recordViolation = useCallback((type: ViolationType) => {
    if (!enabled || isSubmittingRef.current) return;

    const now = Date.now();
    if (now - lastViolationTimeRef.current < COOLDOWN_MS) return;
    lastViolationTimeRef.current = now;

    countRef.current += 1;
    const count = countRef.current;

    const violation: SecurityViolation = { type, timestamp: new Date().toISOString() };
    setViolations((prev) => [...prev, violation]);
    setViolationCount(count);
    setLastViolationType(type);
    setShowWarning(true);

    if (count >= threshold) {
      isSubmittingRef.current = true;
      setTimeout(() => onAutoSubmitRef.current(), FINAL_DELAY_MS);
    }
  }, [enabled, threshold]);

  useEffect(() => {
    if (!enabled) return;

    document.body.classList.add('exam-secure');

    const handleContextMenu = (e: MouseEvent) => e.preventDefault();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && ['c', 'a', 'v', 'x', 'u', 's', 'p'].includes(e.key.toLowerCase())) {
        e.preventDefault();
      }
      if (e.key === 'F12') e.preventDefault();
    };

    const handleSelectStart = (e: Event) => e.preventDefault();

    const handleVisibilityChange = () => {
      if (document.hidden) recordViolation('tab_switch');
    };

    const handleBlur = () => {
      blurTimerRef.current = setTimeout(() => recordViolation('window_blur'), 1000);
    };

    const handleFocus = () => {
      if (blurTimerRef.current) {
        clearTimeout(blurTimerRef.current);
        blurTimerRef.current = null;
      }
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('selectstart', handleSelectStart);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.body.classList.remove('exam-secure');
      if (blurTimerRef.current) clearTimeout(blurTimerRef.current);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('selectstart', handleSelectStart);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
    };
  }, [enabled, recordViolation]);

  return {
    violations,
    violationCount,
    showWarning,
    lastViolationType,
    dismissWarning: () => setShowWarning(false),
  };
}
