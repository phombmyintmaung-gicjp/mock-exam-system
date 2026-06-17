import { useEffect } from 'react';
import { useExamSessionStore } from '@/store/examSessionStore';

const useElapsedTimer = (questionIndex: number) => {
  const tickQuestionTimer      = useExamSessionStore((s) => s.tickQuestionTimer);
  const accumulateQuestionTime = useExamSessionStore((s) => s.accumulateQuestionTime);

  useEffect(() => {
    accumulateQuestionTime(); // flush previous question's time into totalElapsedSeconds
    const id = setInterval(() => tickQuestionTimer(), 1000);
    return () => clearInterval(id);
  }, [questionIndex, accumulateQuestionTime, tickQuestionTimer]);
};

export default useElapsedTimer;
