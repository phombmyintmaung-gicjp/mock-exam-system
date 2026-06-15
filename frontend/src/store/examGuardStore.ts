import { create } from 'zustand';

interface ExamGuardState {
  isActive: boolean;
  pendingPath: string | null;
  activate: () => void;
  deactivate: () => void;
  setPendingPath: (path: string | null) => void;
}

export const useExamGuardStore = create<ExamGuardState>((set) => ({
  isActive: false,
  pendingPath: null,
  activate: () => set({ isActive: true, pendingPath: null }),
  deactivate: () => set({ isActive: false, pendingPath: null }),
  setPendingPath: (path) => set({ pendingPath: path }),
}));
