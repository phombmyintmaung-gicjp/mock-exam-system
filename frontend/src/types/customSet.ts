export interface CustomSetSummary {
  id: number;
  name: string;
  description: string | null;
  slug: string;
  timeLimitSeconds: number;
  passingScore: number;
  isActive: boolean;
  questionCount: number;
  createdAt: string;
}

export interface CustomSetChoice {
  id: number;
  text: string;
  isCorrect: boolean;
  order: number;
}

export interface CustomSetQuestion {
  id: number;
  text: string;
  category: string;
  explanation: string | null;
  sortOrder: number;
  choices: CustomSetChoice[];
}

export interface CustomSetDetail extends Omit<CustomSetSummary, 'questionCount'> {
  questions: CustomSetQuestion[];
}

export interface CustomExamLandingInfo {
  id: number;
  name: string;
  description: string | null;
  slug: string;
  timeLimitSeconds: number;
  passingScore: number;
  questionCount: number;
}

export interface CustomAnswerRecord {
  questionId: number;
  questionText: string;
  explanation: string | null;
  isCorrect: boolean;
  selectedChoiceId: number | null;
  choices: { id: number; text: string; isCorrect: boolean }[];
}

export interface CustomExamResult {
  id: number;
  setId: number;
  setName: string;
  score: number;
  totalQuestions: number;
  passingScore: number;
  status: 'pass' | 'fail';
  completedAt: string;
  answerRecords?: CustomAnswerRecord[];
}

export interface AdminCustomExamResult {
  id: number;
  user: { id: number; name: string; email: string };
  score: number;
  totalQuestions: number;
  passingScore: number;
  status: 'pass' | 'fail';
  completedAt: string;
}

export interface AdminCustomExamResultDetail extends AdminCustomExamResult {
  setId: number;
  answerRecords: CustomAnswerRecord[];
}
