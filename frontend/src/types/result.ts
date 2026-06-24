export type PassFailStatus = 'pass' | 'fail';

export interface AnswerRecord {
  questionId: number;
  questionText: string;
  explanation: string;
  choices: { id: number; text: string }[];
  selectedChoiceId: number | null;
  correctChoiceId: number;
  isCorrect: boolean;
  timeTakenSeconds: number | null;
}

export interface ExamResult {
  id: number;
  sessionId: number;
  linkedSessionId?: number;
  userId: number;
  category: string;
  score: number;
  totalQuestions: number;
  passingScore: number;
  status: PassFailStatus;
  answers: AnswerRecord[];
  completedAt: string;
}

export interface HistoryItem {
  id: number;
  category: string;
  mode: string;
  score: number;
  totalQuestions: number;
  status: PassFailStatus;
  completedAt: string;
  userName?: string;
}
