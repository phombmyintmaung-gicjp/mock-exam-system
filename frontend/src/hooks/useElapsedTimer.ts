import { useEffect } from 'react';
import { useExamSessionStore } from '@/store/examSessionStore';

const useElapsedTimer = (questionIndex: number) => {
  const tickQuestionTimer = useExamSessionStore((s) => s.tickQuestionTimer);
  const resetQuestionTimer = useExamSessionStore((s) => s.resetQuestionTimer);

  useEffect(() => {
    resetQuestionTimer();
    const id = setInterval(() => tickQuestionTimer(), 1000);
    return () => clearInterval(id);
  }, [questionIndex, resetQuestionTimer, tickQuestionTimer]);
};

export default useElapsedTimer;
