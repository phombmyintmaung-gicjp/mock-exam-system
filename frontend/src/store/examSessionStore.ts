import { create } from 'zustand';
import type { ExamMode, Question } from '@/types/exam';

interface ExamSession {
  sessionId: number | null;
  linkedSessionId?: number;
  mode: ExamMode;
  questions: Question[];
  currentIndex: number;
  answers: Record<number, number>;
  flagged: Set<number>;
  secondsRemaining: number;
  questionElapsedSeconds: number;
  totalElapsedSeconds: number;
}

type NewSession = Omit<ExamSession, 'questionElapsedSeconds' | 'totalElapsedSeconds'>;

interface ExamSessionState {
  session: ExamSession | null;
  setSession: (session: NewSession) => void;
  setAnswer: (questionId: number, choiceId: number) => void;
  toggleFlag: (questionId: number) => void;
  nextQuestion: () => void;
  prevQuestion: () => void;
  tickTimer: () => void;
  tickQuestionTimer: () => void;
  accumulateQuestionTime: () => void;
  resetSession: () => void;
}

export const useExamSessionStore = create<ExamSessionState>((set) => ({
  session: null,
  setSession: (session) => set({ session: { ...session, questionElapsedSeconds: 0, totalElapsedSeconds: 0 } }),
  setAnswer: (questionId, choiceId) =>
    set((state) => {
      if (!state.session) return state;
      return { session: { ...state.session, answers: { ...state.session.answers, [questionId]: choiceId } } };
    }),
  toggleFlag: (questionId) =>
    set((state) => {
      if (!state.session) return state;
      const flagged = new Set(state.session.flagged);
      flagged.has(questionId) ? flagged.delete(questionId) : flagged.add(questionId);
      return { session: { ...state.session, flagged } };
    }),
  nextQuestion: () =>
    set((state) => {
      if (!state.session) return state;
      return { session: { ...state.session, currentIndex: state.session.currentIndex + 1 } };
    }),
  prevQuestion: () =>
    set((state) => {
      if (!state.session) return state;
      return { session: { ...state.session, currentIndex: state.session.currentIndex - 1 } };
    }),
  tickTimer: () =>
    set((state) => {
      if (!state.session) return state;
      return { session: { ...state.session, secondsRemaining: state.session.secondsRemaining - 1 } };
    }),
  tickQuestionTimer: () =>
    set((state) => {
      if (!state.session) return state;
      return { session: { ...state.session, questionElapsedSeconds: state.session.questionElapsedSeconds + 1 } };
    }),
  accumulateQuestionTime: () =>
    set((state) => {
      if (!state.session) return state;
      return {
        session: {
          ...state.session,
          totalElapsedSeconds: state.session.totalElapsedSeconds + state.session.questionElapsedSeconds,
          questionElapsedSeconds: 0,
        },
      };
    }),
  resetSession: () => set({ session: null }),
}));
