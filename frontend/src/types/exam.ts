export type Difficulty = 'easy' | 'medium' | 'hard';
export type ExamMode = 'exam' | 'study';

export interface Choice {
  id: number;
  text: string;
  isCorrect?: boolean;
}

export interface Question {
  id: number;
  text: string;
  choices: Choice[];
  difficulty: Difficulty;
  category: string;
  explanation?: string;
}

export interface ExamSession {
  sessionId: number;
  questions: Question[];
  timeLimitSeconds: number;
  mode: ExamMode;
}

export interface CategoryExamSetting {
  category: string;
  time_limit_seconds: number;
  passing_score: number;
  question_count: number;
}
