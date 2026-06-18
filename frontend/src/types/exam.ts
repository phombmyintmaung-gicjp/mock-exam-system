export type ExamMode = 'exam' | 'study';
export type JLPTLevel = 'N1' | 'N2' | 'N3' | 'N4' | 'N5';
export type JLPTTestType = '文字語彙' | '文法読解';

export interface Choice {
  id: number;
  text: string;
  isCorrect?: boolean;
}

export interface Passage {
  id: number;
  title: string;
  content: string;
  level: JLPTLevel;
  category_id?: number | null;
  category?: { id: number; name: string } | null;
}

export interface Question {
  id: number;
  text: string;
  choices: Choice[];
  category: string;
  questionType?: string;
  explanation?: string;
  passage?: Passage;
}

// Raw shape returned by GET /admin/questions — Eloquent serialises to snake_case.
export interface AdminQuestion {
  id: number;
  text: string;
  category: string;
  question_type?: string | null;
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
