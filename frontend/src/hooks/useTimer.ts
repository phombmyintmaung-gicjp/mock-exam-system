import { useEffect, useRef } from 'react';
import { useExamSessionStore } from '@/store/examSessionStore';

const useTimer = (secondsRemaining: number, onExpire: () => void) => {
  const onExpireRef = useRef(onExpire);
  onExpireRef.current = onExpire;
  const tickTimer = useExamSessionStore((s) => s.tickTimer);

  useEffect(() => {
    if (secondsRemaining <= 0) {
      onExpireRef.current();
      return;
    }
    const id = setTimeout(() => tickTimer(), 1000);
    return () => clearTimeout(id);
  }, [secondsRemaining, tickTimer]);
};

export default useTimer;
