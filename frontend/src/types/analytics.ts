export interface CategoryStat {
  category: string;
  totalAttempts: number;
  passCount: number;
  failCount: number;
  passRate: number;
}

export interface WeakArea {
  category: string;
  wrongCount: number;
  totalAttempted: number;
  accuracy: number;
}

export interface ScoreTrend {
  date: string;
  score: number;
  category: string;
}

export interface RetryStats {
  category: string;
  attemptCount: number;
  bestScore: number;
  latestScore: number;
}

export interface DifficultyStats {
  questionId: number;
  questionText: string;
  category: string;
  questionType: string | null;
  attemptCount: number;
  correctRate: number;
}

export interface QuestionIncorrectStat {
  questionId: number;
  questionText: string;
  category: string;
  questionType: string | null;
  attemptCount: number;
  incorrectCount: number;
}
