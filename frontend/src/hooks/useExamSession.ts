import { useExamSessionStore } from '@/store/examSessionStore';

const useExamSession = () => {
  const session = useExamSessionStore((s) => s.session);
  const setAnswer = useExamSessionStore((s) => s.setAnswer);
  const toggleFlag = useExamSessionStore((s) => s.toggleFlag);
  const nextQuestion = useExamSessionStore((s) => s.nextQuestion);
  const prevQuestion = useExamSessionStore((s) => s.prevQuestion);
  const resetSession = useExamSessionStore((s) => s.resetSession);

  return { session, setAnswer, toggleFlag, nextQuestion, prevQuestion, resetSession };
};

export default useExamSession;
