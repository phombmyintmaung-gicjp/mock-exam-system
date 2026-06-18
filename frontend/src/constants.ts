import type { JLPTLevel } from '@/types/exam';

// ── Exam security ─────────────────────────────────────────────────────────────

export const EXAM_SECURITY_THRESHOLD = 3;

// ── JLPT levels ───────────────────────────────────────────────────────────────

export const JLPT_LEVELS: JLPTLevel[] = ['N1', 'N2', 'N3', 'N4', 'N5'];

// ── JLPT 問題 type lists ───────────────────────────────────────────────────────

export const MONDAI_VOCAB = ['問題1', '問題2', '問題3', '問題4', '問題5'] as const;
export type VocabMondai = (typeof MONDAI_VOCAB)[number];

export const MONDAI_GRAMMAR = ['問題1', '問題2', '問題3', '問題4', '問題5', '問題6'] as const;
export type GrammarMondai = (typeof MONDAI_GRAMMAR)[number];

// ── JLPT category helpers ─────────────────────────────────────────────────────

export const jlptVocabCategory  = (level: JLPTLevel) => `JLPT-${level}-文字語彙` as const;
export const jlptGrammarCategory = (level: JLPTLevel) => `JLPT-${level}-文法読解` as const;
export const jlptFullCategory    = (level: JLPTLevel) => `JLPT-${level}-Full` as const;

// ── JLPT full-exam time limits (seconds) ─────────────────────────────────────

export interface JLPTFullExamTimes {
  /** N1 / N2 use a combined paper; N3–N5 use separate papers. */
  combined?: number;
  vocab?: number;
  grammar?: number;
}

export const JLPT_FULL_EXAM_TIMES: Record<JLPTLevel, JLPTFullExamTimes> = {
  N1: { combined: 6600 },   // 110 min
  N2: { combined: 6300 },   // 105 min
  N3: { vocab: 1800, grammar: 4200 },  // 30 min + 70 min
  N4: { vocab: 1500, grammar: 3300 },  // 25 min + 55 min
  N5: { vocab: 1200, grammar: 2400 },  // 20 min + 40 min
};

// ── IT certification categories ───────────────────────────────────────────────

export const IT_CATEGORIES = ['AWS', 'Network', 'Security', 'Linux'] as const;
export type ITCategory = (typeof IT_CATEGORIES)[number];

// ── Question count selector options ──────────────────────────────────────────

/** 500 is used as "all questions" — the backend returns all available. */
export const QUESTION_COUNT_OPTIONS = [10, 20, 500] as const;
export type QuestionCountOption = (typeof QUESTION_COUNT_OPTIONS)[number];
export const ALL_QUESTIONS_SENTINEL = 500;

// ── JLPT level UI theme (Tailwind gradient classes) ──────────────────────────

export interface LevelTheme {
  active: string;
  glow: string;
}

export const JLPT_LEVEL_THEMES: Record<JLPTLevel, LevelTheme> = {
  N1: { active: 'from-rose-500 to-pink-500',    glow: 'shadow-rose-500/30' },
  N2: { active: 'from-orange-500 to-amber-500', glow: 'shadow-orange-500/30' },
  N3: { active: 'from-yellow-500 to-amber-400', glow: 'shadow-yellow-500/30' },
  N4: { active: 'from-emerald-500 to-teal-500', glow: 'shadow-emerald-500/30' },
  N5: { active: 'from-blue-500 to-indigo-500',  glow: 'shadow-blue-500/30' },
};

// ── API ───────────────────────────────────────────────────────────────────────

export const API_BASE_PATH = '/api/v1';

// ── Roles ─────────────────────────────────────────────────────────────────────

export const USER_ROLES = ['admin', 'employee'] as const;
export type UserRole = (typeof USER_ROLES)[number];

// ── Exam modes ────────────────────────────────────────────────────────────────

export const EXAM_MODES = ['exam', 'study'] as const;

// ── Locale ────────────────────────────────────────────────────────────────────

export const I18N_STORAGE_KEY = 'i18n-lang';
export const DEFAULT_LOCALE   = 'ja';
export const SUPPORTED_LOCALES = ['ja', 'en'] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

// ── PDF filename ──────────────────────────────────────────────────────────────

export const PDF_FILENAME_PREFIX = 'Result';
