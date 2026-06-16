import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { clsx } from 'clsx';
import { PageShell } from '@/components/layout/PageShell';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { countQuestionsByTypes, startExamSession } from '@/services/examService';
import { useExamSessionStore } from '@/store/examSessionStore';
import type { ExamMode, JLPTLevel, JLPTTestType } from '@/types/exam';

// ── JLPT section definitions ─────────────────────────────────────────────────

const LEVELS: JLPTLevel[] = ['N1', 'N2', 'N3', 'N4', 'N5'];

const LEVEL_GRADIENTS: Record<JLPTLevel, { active: string; glow: string }> = {
  N1: { active: 'from-rose-500 to-pink-500',    glow: 'shadow-rose-500/30' },
  N2: { active: 'from-orange-500 to-amber-500', glow: 'shadow-orange-500/30' },
  N3: { active: 'from-yellow-500 to-amber-400', glow: 'shadow-yellow-500/30' },
  N4: { active: 'from-emerald-500 to-teal-500', glow: 'shadow-emerald-500/30' },
  N5: { active: 'from-blue-500 to-indigo-500',  glow: 'shadow-blue-500/30' },
};

interface JLPTSection {
  id: string;
  labelKey: string;
  descKey: string;
  icon: string;
  gradientFrom: string;
  gradientTo: string;
  glow: string;
  parentType: JLPTTestType;
  questionTypes: string[];
  isReading: boolean;
}

const JLPT_SECTIONS: JLPTSection[] = [
  {
    id: 'vocab',
    labelKey: 'exam.jlpt.vocab',
    descKey: 'exam.jlpt.vocabDesc',
    icon: '語',
    gradientFrom: 'from-blue-500',
    gradientTo: 'to-cyan-500',
    glow: 'shadow-blue-500/20',
    parentType: '文字語彙',
    questionTypes: ['問題4', '問題5'],
    isReading: false,
  },
  {
    id: 'kanji',
    labelKey: 'exam.jlpt.kanji',
    descKey: 'exam.jlpt.kanjiDesc',
    icon: '漢',
    gradientFrom: 'from-violet-500',
    gradientTo: 'to-purple-500',
    glow: 'shadow-violet-500/20',
    parentType: '文字語彙',
    questionTypes: ['問題1', '問題2', '問題3'],
    isReading: false,
  },
  {
    id: 'grammar',
    labelKey: 'exam.jlpt.grammar',
    descKey: 'exam.jlpt.grammarDesc',
    icon: '文',
    gradientFrom: 'from-emerald-500',
    gradientTo: 'to-teal-500',
    glow: 'shadow-emerald-500/20',
    parentType: '文法読解',
    questionTypes: ['もんだい１', 'もんだい２'],
    isReading: false,
  },
  {
    id: 'reading',
    labelKey: 'exam.jlpt.reading',
    descKey: 'exam.jlpt.readingDesc',
    icon: '読',
    gradientFrom: 'from-rose-500',
    gradientTo: 'to-pink-500',
    glow: 'shadow-rose-500/20',
    parentType: '文法読解',
    questionTypes: ['もんだい３', 'もんだい４', 'もんだい５', 'もんだい６'],
    isReading: true,
  },
];

// ── IT category definitions ───────────────────────────────────────────────────

interface ITCategoryConfig {
  id: string;
  labelKey: string;
  gradientFrom: string;
  gradientTo: string;
  glow: string;
}

const IT_CATEGORIES: ITCategoryConfig[] = [
  { id: 'AWS',      labelKey: 'exam.it.aws',      gradientFrom: 'from-orange-500', gradientTo: 'to-amber-400',  glow: 'shadow-orange-500/20' },
  { id: 'Network',  labelKey: 'exam.it.network',  gradientFrom: 'from-blue-500',   gradientTo: 'to-cyan-500',   glow: 'shadow-blue-500/20' },
  { id: 'Security', labelKey: 'exam.it.security', gradientFrom: 'from-rose-500',   gradientTo: 'to-red-500',    glow: 'shadow-rose-500/20' },
  { id: 'Linux',    labelKey: 'exam.it.linux',    gradientFrom: 'from-yellow-500', gradientTo: 'to-lime-500',   glow: 'shadow-yellow-500/20' },
];

// ── Component ─────────────────────────────────────────────────────────────────

const ExamSelect = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isJLPT = searchParams.get('type') === 'jlpt';
  const setSession = useExamSessionStore((s) => s.setSession);

  const [selectedLevel, setSelectedLevel] = useState<JLPTLevel>('N5');
  const [counts, setCounts] = useState<Record<string, number | null>>({});
  const [countsLoading, setCountsLoading] = useState(false);
  const [starting, setStarting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedCounts, setSelectedCounts] = useState<Record<string, number>>({});

  const COUNT_OPTIONS = [10, 20, 500] as const;
  const getCount = (key: string) => selectedCounts[key] ?? 20;
  const setCount = (key: string, n: number) => setSelectedCounts((prev) => ({ ...prev, [key]: n }));

  // Pre-fetch question counts for all 4 JLPT sections on level change
  useEffect(() => {
    if (!isJLPT) return;
    let cancelled = false;
    setCountsLoading(true);
    setCounts({});

    Promise.all(
      JLPT_SECTIONS.map(async (sec) => {
        const category = `JLPT-${selectedLevel}-${sec.parentType}`;
        const count = await countQuestionsByTypes(category, sec.questionTypes);
        return { id: sec.id, count };
      }),
    ).then((results) => {
      if (cancelled) return;
      setCounts(Object.fromEntries(results.map(({ id, count }) => [id, count])));
      setCountsLoading(false);
    });

    return () => { cancelled = true; };
  }, [isJLPT, selectedLevel]);

  const handleStart = async (
    category: string,
    mode: ExamMode,
    isReading: boolean,
    questionTypes?: string[],
    questionCount?: number,
  ) => {
    const key = `${category}-${mode}`;
    setStarting(key);
    setError(null);
    try {
      const session = await startExamSession(category, mode, questionTypes, questionCount);
      setSession({
        sessionId: session.sessionId,
        mode: session.mode,
        questions: session.questions,
        currentIndex: 0,
        answers: {},
        flagged: new Set(),
        secondsRemaining: session.timeLimitSeconds,
      });
      navigate(isReading ? '/reading/session' : mode === 'exam' ? '/exam/session' : '/study/session');
    } catch {
      setError(t('common.error'));
    } finally {
      setStarting(null);
    }
  };

  return (
    <PageShell>
      {isJLPT ? (
        // ── JLPT view ──────────────────────────────────────────────────────
        <>
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t('exam.jlpt.title')}</h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-white/50">{t('exam.jlpt.subtitle')}</p>
          </div>

          {/* Level tabs */}
          <div className="mb-6 flex gap-2 overflow-x-auto pb-1">
            {LEVELS.map((level) => {
              const g = LEVEL_GRADIENTS[level];
              const isActive = level === selectedLevel;
              return (
                <button
                  key={level}
                  onClick={() => setSelectedLevel(level)}
                  className={clsx(
                    'min-w-[64px] rounded-xl px-5 py-2.5 text-sm font-bold transition-all',
                    isActive
                      ? `bg-gradient-to-r ${g.active} text-white shadow-lg ${g.glow}`
                      : 'border border-slate-200 dark:border-white/15 bg-black/5 dark:bg-white/8 text-slate-500 dark:text-white/55 hover:bg-black/8 dark:hover:bg-white/15 hover:text-slate-700 dark:hover:text-white/85',
                  )}
                >
                  {level}
                </button>
              );
            })}
          </div>

          {error && (
            <p className="mb-4 rounded-xl border border-rose-400/30 bg-rose-500/15 px-4 py-3 text-sm text-rose-300">{error}</p>
          )}

          {countsLoading ? (
            <div className="flex justify-center py-16"><Spinner size="lg" /></div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {JLPT_SECTIONS.map((sec) => {
                const category = `JLPT-${selectedLevel}-${sec.parentType}`;
                const examKey  = `${category}-${sec.id}-exam`;
                const studyKey = `${category}-${sec.id}-study`;
                const count    = counts[sec.id];
                const isEmpty  = count === 0;

                return (
                  <div key={sec.id} className={clsx('glass-card rounded-2xl p-5 shadow-xl', sec.glow)}>
                    <div className={clsx(
                      'mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br text-2xl font-bold text-white shadow-lg',
                      sec.gradientFrom, sec.gradientTo, sec.glow,
                    )}>
                      {sec.icon}
                    </div>

                    <div className="mb-1 flex items-center gap-2">
                      <h2 className="text-lg font-bold text-slate-900 dark:text-white">{t(sec.labelKey)}</h2>
                      {count !== null && count !== undefined && (
                        <span className={clsx(
                          'rounded-full px-2 py-0.5 text-xs font-semibold',
                          isEmpty
                            ? 'bg-slate-100 text-slate-400 dark:bg-white/8 dark:text-white/30'
                            : 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300',
                        )}>
                          {count}
                        </span>
                      )}
                    </div>

                    <p className="mb-5 text-xs text-slate-500 dark:text-white/50">{t(sec.descKey)}</p>

                    {isEmpty ? (
                      <div className="flex items-center gap-2 rounded-xl border border-dashed border-slate-200 py-4 px-4 dark:border-white/10">
                        <svg className="h-4 w-4 shrink-0 text-slate-300 dark:text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                        </svg>
                        <span className="text-xs text-slate-400 dark:text-white/30">{t('common.noQuestionsAvailable')}</span>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2">
                        <div className="mb-1 flex items-center gap-2">
                          <span className="text-xs text-slate-400 dark:text-white/40">{t('exam.numQuestions')}</span>
                          <div className="flex gap-1">
                            {COUNT_OPTIONS.map((n) => (
                              <button
                                key={n}
                                type="button"
                                onClick={() => setCount(sec.id, n)}
                                className={clsx(
                                  'rounded-lg px-2.5 py-1 text-xs font-semibold transition-all',
                                  getCount(sec.id) === n
                                    ? 'bg-amber-500 text-white'
                                    : 'border border-slate-200 dark:border-white/10 bg-black/5 dark:bg-white/5 text-slate-500 dark:text-white/50 hover:bg-black/8 dark:hover:bg-white/10',
                                )}
                              >
                                {n === 500 ? t('exam.numQuestionsAll') : n}
                              </button>
                            ))}
                          </div>
                        </div>
                        <Button
                          label={starting === examKey ? '…' : t('exam.examMode')}
                          disabled={starting !== null}
                          onClick={() => handleStart(category, 'exam', sec.isReading, sec.questionTypes, getCount(sec.id))}
                        />
                        <Button
                          label={starting === studyKey ? '…' : t('exam.studyMode')}
                          variant="secondary"
                          disabled={starting !== null}
                          onClick={() => handleStart(category, 'study', sec.isReading, sec.questionTypes, getCount(sec.id))}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Level badge */}
          <div className="mt-6 flex items-center gap-2">
            <span className={clsx(
              'rounded-full bg-gradient-to-r px-4 py-1 text-sm font-bold text-white shadow-md',
              LEVEL_GRADIENTS[selectedLevel].active, LEVEL_GRADIENTS[selectedLevel].glow,
            )}>
              {selectedLevel}
            </span>
            <span className="text-sm text-slate-400 dark:text-white/45">{t('exam.jlpt.levelSelected', { level: selectedLevel })}</span>
          </div>
        </>
      ) : (
        // ── IT view ────────────────────────────────────────────────────────
        <>
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t('exam.it.title')}</h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-white/50">{t('exam.it.subtitle')}</p>
          </div>

          {error && (
            <p className="mb-4 rounded-xl border border-rose-400/30 bg-rose-500/15 px-4 py-3 text-sm text-rose-300">{error}</p>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            {IT_CATEGORIES.map((cat) => {
              const examKey  = `${cat.id}-exam`;
              const studyKey = `${cat.id}-study`;
              return (
                <div key={cat.id} className={clsx('glass-card rounded-2xl p-5 shadow-xl', cat.glow)}>
                  <div className={clsx(
                    'mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br text-lg font-extrabold text-white shadow-lg',
                    cat.gradientFrom, cat.gradientTo, cat.glow,
                  )}>
                    {cat.id.slice(0, 2)}
                  </div>
                  <h2 className="mb-1 text-lg font-bold text-slate-900 dark:text-white">{t(cat.labelKey)}</h2>
                  <p className="mb-5 text-xs text-slate-500 dark:text-white/50">{t('exam.it.subtitle')}</p>
                  <div className="flex flex-col gap-2">
                    <div className="mb-1 flex items-center gap-2">
                      <span className="text-xs text-slate-400 dark:text-white/40">{t('exam.numQuestions')}</span>
                      <div className="flex gap-1">
                        {COUNT_OPTIONS.map((n) => (
                          <button
                            key={n}
                            type="button"
                            onClick={() => setCount(cat.id, n)}
                            className={clsx(
                              'rounded-lg px-2.5 py-1 text-xs font-semibold transition-all',
                              getCount(cat.id) === n
                                ? 'bg-indigo-500 text-white'
                                : 'border border-slate-200 dark:border-white/10 bg-black/5 dark:bg-white/5 text-slate-500 dark:text-white/50 hover:bg-black/8 dark:hover:bg-white/10',
                            )}
                          >
                            {n === 500 ? t('exam.numQuestionsAll') : n}
                          </button>
                        ))}
                      </div>
                    </div>
                    <Button
                      label={starting === examKey ? '…' : t('exam.examMode')}
                      disabled={starting !== null}
                      onClick={() => handleStart(cat.id, 'exam', false, undefined, getCount(cat.id))}
                    />
                    <Button
                      label={starting === studyKey ? '…' : t('exam.studyMode')}
                      variant="secondary"
                      disabled={starting !== null}
                      onClick={() => handleStart(cat.id, 'study', false, undefined, getCount(cat.id))}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </PageShell>
  );
};

export default ExamSelect;
