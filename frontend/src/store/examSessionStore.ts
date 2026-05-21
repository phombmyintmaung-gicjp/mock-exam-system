import { create } from 'zustand';
import type { Question } from '@/types/exam';

interface ExamSession {
  sessionId: number | null;
  questions: Question[];
  currentIndex: number;
  answers: Record<number, number>;
  flagged: Set<number>;
  secondsRemaining: number;
}

interface ExamSessionState {
  session: ExamSession | null;
  setSession: (session: ExamSession) => void;
  setAnswer: (questionId: number, choiceId: number) => void;
  toggleFlag: (questionId: number) => void;
  nextQuestion: () => void;
  prevQuestion: () => void;
  tickTimer: () => void;
  resetSession: () => void;
}

export const useExamSessionStore = create<ExamSessionState>((set) => ({
  session: null,
  setSession: (session) => set({ session }),
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
  resetSession: () => set({ session: null }),
}));
