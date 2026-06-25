import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { clsx } from 'clsx';
import { PageShell } from '@/components/layout/PageShell';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Spinner } from '@/components/ui/Spinner';
import { countQuestionsByTypes, countByQuestionType, startExamSession } from '@/services/examService';
import { getITCategories } from '@/services/categoryService';
import { useExamSessionStore } from '@/store/examSessionStore';
import { useAuthStore } from '@/store/authStore';
import type { ExamMode, JLPTLevel, JLPTTestType } from '@/types/exam';
import {
  JLPT_LEVELS,
  JLPT_LEVEL_THEMES,
  JLPT_FULL_EXAM_TIMES,
  MONDAI_VOCAB,
  MONDAI_GRAMMAR,
  QUESTION_COUNT_OPTIONS,
  ALL_QUESTIONS_SENTINEL,
  jlptVocabCategory,
  jlptGrammarCategory,
  jlptFullCategory,
} from '@/constants';

// ── Constants ────────────────────────────────────────────────────────────────

const LEVELS = JLPT_LEVELS;
const LEVEL_GRADIENTS = JLPT_LEVEL_THEMES;
const FULL_EXAM_TIMES = JLPT_FULL_EXAM_TIMES;

const fmt = (s: number) => `${Math.floor(s / 60)}${' min'}`;

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
    questionTypes: ['問題1', '問題2'],
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
    questionTypes: ['問題3', '問題4', '問題5', '問題6'],
    isReading: true,
  },
];

// MONDAI_VOCAB and MONDAI_GRAMMAR imported from @/constants

// Gradient palette for IT category cards — cycles by index
const IT_GRADIENT_PALETTE = [
  { gradientFrom: 'from-orange-500', gradientTo: 'to-amber-400',   glow: 'shadow-orange-500/20' },
  { gradientFrom: 'from-blue-500',   gradientTo: 'to-cyan-500',    glow: 'shadow-blue-500/20' },
  { gradientFrom: 'from-rose-500',   gradientTo: 'to-red-500',     glow: 'shadow-rose-500/20' },
  { gradientFrom: 'from-yellow-500', gradientTo: 'to-lime-500',    glow: 'shadow-yellow-500/20' },
  { gradientFrom: 'from-violet-500', gradientTo: 'to-purple-500',  glow: 'shadow-violet-500/20' },
  { gradientFrom: 'from-emerald-500',gradientTo: 'to-teal-500',    glow: 'shadow-emerald-500/20' },
  { gradientFrom: 'from-pink-500',   gradientTo: 'to-fuchsia-500', glow: 'shadow-pink-500/20' },
] as const;

type JLPTPracticeMode = 'full' | 'section' | 'drill';

// ── Component ─────────────────────────────────────────────────────────────────

const JLPT_LEVEL_RE = /\bN([1-5])\b/i;

function detectCertTarget(cert: string, itNames: string[]): { kind: 'it'; id: string } | { kind: 'jlpt'; level: string } | null {
  for (const name of itNames) {
    if (cert.toUpperCase().includes(name.toUpperCase())) return { kind: 'it', id: name };
  }
  const match = cert.match(JLPT_LEVEL_RE);
  if (match) return { kind: 'jlpt', level: `N${match[1]}` };
  return null;
}

const ExamSelect = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isJLPT = searchParams.get('type') === 'jlpt';
  const setSession = useExamSessionStore((s) => s.setSession);
  const user = useAuthStore((s) => s.user);

  const [itCategories, setItCategories]           = useState<import('@/types/category').Category[]>([]);
  const [itLoading, setItLoading]                 = useState(true);

  const certTarget = user?.targetCertification
    ? detectCertTarget(user.targetCertification, itCategories.map((c) => c.name))
    : null;

  const [selectedLevel, setSelectedLevel]         = useState<JLPTLevel>('N5');
  const [practiceMode, setPracticeMode]           = useState<JLPTPracticeMode>('section');
  const [counts, setCounts]                       = useState<Record<string, number | null>>({});
  const [countsLoading, setCountsLoading]         = useState(false);
  const [typeCounts, setTypeCounts]               = useState<Record<string, Record<string, number>>>({});
  const [typeCountsLoading, setTypeCountsLoading] = useState(false);
  const [starting, setStarting]                   = useState<string | null>(null);
  const [error, setError]                         = useState<string | null>(null);
  const [selectedCounts, setSelectedCounts]       = useState<Record<string, number>>({});
  const [fullExamCounts, setFullExamCounts]       = useState<Record<string, number | null>>({});
  const [fullExamLoading, setFullExamLoading]     = useState(false);

  // Drill selection: questionType → selected boolean, per section
  const [drillSelected, setDrillSelected] = useState<Record<string, boolean>>({});

  // Pending exam: holds section info while the count-picker modal is open
  interface PendingExam { category: string; isReading: boolean; questionTypes: string[]; sectionId: string; }
  const [pendingExam, setPendingExam] = useState<PendingExam | null>(null);

  const COUNT_OPTIONS = QUESTION_COUNT_OPTIONS;
  const getCount = (key: string) => selectedCounts[key] ?? 20;
  const setCount = (key: string, n: number) => setSelectedCounts((prev) => ({ ...prev, [key]: n }));

  // Fetch IT categories from API
  useEffect(() => {
    getITCategories()
      .then(setItCategories)
      .catch(() => {})
      .finally(() => setItLoading(false));
  }, []);

  // Fetch section counts (for Section Practice tab)
  useEffect(() => {
    if (!isJLPT || practiceMode !== 'section') return;
    let cancelled = false;
    setCountsLoading(true);
    setCounts({});
    Promise.all(
      JLPT_SECTIONS.map(async (sec) => {
        const category = sec.parentType === '文字語彙' ? jlptVocabCategory(selectedLevel) : jlptGrammarCategory(selectedLevel);
        const count = await countQuestionsByTypes(category, sec.questionTypes);
        return { id: sec.id, count };
      }),
    ).then((results) => {
      if (cancelled) return;
      setCounts(Object.fromEntries(results.map(({ id, count }) => [id, count])));
      setCountsLoading(false);
    });
    return () => { cancelled = true; };
  }, [isJLPT, selectedLevel, practiceMode]);

  // Fetch per-type counts (for Drill tab)
  useEffect(() => {
    if (!isJLPT || practiceMode !== 'drill') return;
    let cancelled = false;
    setTypeCountsLoading(true);
    setTypeCounts({});
    Promise.all([
      countByQuestionType(jlptVocabCategory(selectedLevel)),
      countByQuestionType(jlptGrammarCategory(selectedLevel)),
    ]).then(([vocab, grammar]) => {
      if (cancelled) return;
      setTypeCounts({ vocab, grammar });
      setTypeCountsLoading(false);
    });
    return () => { cancelled = true; };
  }, [isJLPT, selectedLevel, practiceMode]);

  // Fetch question counts for Full Exam tab
  useEffect(() => {
    if (!isJLPT || practiceMode !== 'full') return;
    let cancelled = false;
    setFullExamLoading(true);
    setFullExamCounts({});
    const times = FULL_EXAM_TIMES[selectedLevel];
    const isCombined = 'combined' in times;
    if (isCombined) {
      countByQuestionType(jlptFullCategory(selectedLevel)).then((res) => {
        if (cancelled) return;
        const total = Object.values(res).reduce((a, b) => a + b, 0);
        setFullExamCounts({ full: total });
        setFullExamLoading(false);
      });
    } else {
      Promise.all([
        countByQuestionType(jlptVocabCategory(selectedLevel)),
        countByQuestionType(jlptGrammarCategory(selectedLevel)),
      ]).then(([vocab, grammar]) => {
        if (cancelled) return;
        setFullExamCounts({
          vocab:   Object.values(vocab).reduce((a, b) => a + b, 0),
          grammar: Object.values(grammar).reduce((a, b) => a + b, 0),
        });
        setFullExamLoading(false);
      });
    }
    return () => { cancelled = true; };
  }, [isJLPT, selectedLevel, practiceMode]);

  // Reset drill selection when level or mode changes
  useEffect(() => { setDrillSelected({}); }, [selectedLevel, practiceMode]);

  const toggleDrill = (sectionId: string, type: string) =>
    setDrillSelected((prev) => {
      const key = `${sectionId}:${type}`;
      return { ...prev, [key]: !prev[key] };
    });

  const selectedVocab   = MONDAI_VOCAB.filter((t) => drillSelected[`vocab:${t}`]);
  const selectedGrammar = MONDAI_GRAMMAR.filter((t) => drillSelected[`grammar:${t}`]);

  const handleStart = async (
    category: string,
    mode: ExamMode,
    isReading: boolean,
    questionTypes?: string[],
    questionCount?: number,
  ) => {
    const key = `${category}-${questionTypes?.join(',') ?? ''}-${mode}`;
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
      const slug = encodeURIComponent(category);
      navigate(isReading ? `/reading/session/${slug}` : mode === 'exam' ? `/exam/session/${slug}` : `/study/session/${slug}`);
    } catch {
      setError(t('common.error'));
    } finally {
      setStarting(null);
    }
  };

  const handleConfirmExam = async () => {
    if (!pendingExam) return;
    const { category, isReading, questionTypes, sectionId } = pendingExam;
    setPendingExam(null);
    await handleStart(category, 'exam', isReading, questionTypes.length > 0 ? questionTypes : undefined, getCount(sectionId));
  };

  const modeTabs: { id: JLPTPracticeMode; labelKey: string }[] = [
    { id: 'full',    labelKey: 'exam.jlpt.modeFullExam' },
    { id: 'section', labelKey: 'exam.jlpt.modeSectionPractice' },
    { id: 'drill',   labelKey: 'exam.jlpt.modeDrill' },
  ];

  return (
    <PageShell>
      {/* Target certification suggestion banner */}
      {certTarget && (
        <div className="mb-5 flex flex-col gap-2 rounded-xl border border-amber-400/30 bg-amber-500/10 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-amber-600 dark:text-amber-400">
              {t('exam.certBanner.goal')}
            </p>
            <p className="mt-0.5 text-sm text-slate-700 dark:text-white/75">
              {certTarget.kind === 'jlpt'
                ? t('exam.certBanner.jlpt', { level: certTarget.level })
                : t('exam.certBanner.it', { cert: certTarget.id })}
            </p>
          </div>
          <button
            onClick={() => {
              const target = certTarget;
              if (!target) return;
              if (target.kind === 'jlpt') {
                navigate('/exam/select?type=jlpt');
                setSelectedLevel(target.level as JLPTLevel);
              } else {
                navigate('/exam/select');
              }
            }}
            className="shrink-0 rounded-xl bg-amber-500 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-600 transition-colors"
          >
            {t('exam.certBanner.start')}
          </button>
        </div>
      )}

      {isJLPT ? (
        <>
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t('exam.jlpt.title')}</h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-white/50">{t('exam.jlpt.subtitle')}</p>
          </div>

          {/* Level tabs */}
          <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
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

          {/* Practice mode tabs */}
          <div className="mb-6 flex gap-1 rounded-xl border border-slate-200 dark:border-white/10 bg-black/3 dark:bg-white/5 p-1">
            {modeTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setPracticeMode(tab.id)}
                className={clsx(
                  'flex-1 rounded-lg py-2 text-xs font-semibold transition-all',
                  practiceMode === tab.id
                    ? 'bg-white dark:bg-white/15 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 dark:text-white/45 hover:text-slate-700 dark:hover:text-white/70',
                )}
              >
                {t(tab.labelKey)}
              </button>
            ))}
          </div>

          {error && (
            <p className="mb-4 rounded-xl border border-rose-400/30 bg-rose-500/15 px-4 py-3 text-sm text-rose-300">{error}</p>
          )}

          {/* ── Full Exam Simulation ── */}
          {practiceMode === 'full' && (
            <FullExamTab
              level={selectedLevel}
              starting={starting}
              onStart={handleStart}
              counts={fullExamCounts}
              loading={fullExamLoading}
              t={t}
            />
          )}

          {/* ── Section Practice ── */}
          {practiceMode === 'section' && (
            countsLoading ? (
              <div className="flex justify-center py-16"><Spinner size="lg" /></div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {JLPT_SECTIONS.map((sec) => {
                  const category = sec.parentType === '文字語彙' ? jlptVocabCategory(selectedLevel) : jlptGrammarCategory(selectedLevel);
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
                          <span className="text-xs text-slate-400 dark:text-white/30">{t('common.noQuestionsAvailable')}</span>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-2">
                          <Button
                            label={starting !== null ? '…' : t('exam.examMode')}
                            disabled={starting !== null}
                            onClick={() => setPendingExam({ category, isReading: sec.isReading, questionTypes: sec.questionTypes, sectionId: sec.id })}
                          />
                          <Button
                            label={starting === studyKey ? '…' : t('exam.studyMode')}
                            variant="secondary"
                            disabled={starting !== null}
                            onClick={() => handleStart(category, 'study', sec.isReading, sec.questionTypes, ALL_QUESTIONS_SENTINEL)}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )
          )}

          {/* ── 問題 Drill ── */}
          {practiceMode === 'drill' && (
            typeCountsLoading ? (
              <div className="flex justify-center py-16"><Spinner size="lg" /></div>
            ) : (
              <div className="space-y-4">
                <DrillSection
                  titleKey="exam.jlpt.vocabSection"
                  sectionId="vocab"
                  mondai={MONDAI_VOCAB}
                  counts={typeCounts.vocab ?? {}}
                  selected={drillSelected}
                  onToggle={toggleDrill}
                  onStart={(mode) => handleStart(
                    jlptVocabCategory(selectedLevel), mode, false, selectedVocab, ALL_QUESTIONS_SENTINEL,
                  )}
                  starting={starting}
                  category={jlptVocabCategory(selectedLevel)}
                  selectedTypes={selectedVocab}
                  t={t}
                />
                <DrillSection
                  titleKey="exam.jlpt.grammarSection"
                  sectionId="grammar"
                  mondai={MONDAI_GRAMMAR}
                  counts={typeCounts.grammar ?? {}}
                  selected={drillSelected}
                  onToggle={toggleDrill}
                  onStart={(mode) => handleStart(
                    jlptGrammarCategory(selectedLevel), mode, true, selectedGrammar, ALL_QUESTIONS_SENTINEL,
                  )}
                  starting={starting}
                  category={jlptGrammarCategory(selectedLevel)}
                  selectedTypes={selectedGrammar}
                  t={t}
                />
              </div>
            )
          )}

          {/* Count picker modal — opens when Exam Mode is clicked in Section Practice */}
          <Modal
            isOpen={pendingExam !== null}
            title={t('exam.selectCountTitle')}
            onClose={() => setPendingExam(null)}
          >
            {pendingExam && (
              <div className="space-y-5">
                <div className="flex flex-wrap gap-2">
                  {COUNT_OPTIONS.map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setCount(pendingExam.sectionId, n)}
                      className={clsx(
                        'rounded-xl border px-5 py-2.5 text-sm font-semibold transition-all',
                        getCount(pendingExam.sectionId) === n
                          ? 'border-amber-400/50 bg-amber-500 text-white shadow-md'
                          : 'border-slate-200 dark:border-white/10 bg-black/5 dark:bg-white/5 text-slate-600 dark:text-white/60 hover:bg-black/8 dark:hover:bg-white/10',
                      )}
                    >
                      {n === ALL_QUESTIONS_SENTINEL ? t('exam.numQuestionsAll') : n}
                    </button>
                  ))}
                </div>
                <Button
                  label={starting !== null ? '…' : t('exam.startExam')}
                  disabled={starting !== null}
                  onClick={handleConfirmExam}
                  className="w-full"
                />
              </div>
            )}
          </Modal>

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
        // ── IT view ──────────────────────────────────────────────────────────
        <>
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t('exam.it.title')}</h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-white/50">{t('exam.it.subtitle')}</p>
          </div>

          {error && (
            <p className="mb-4 rounded-xl border border-rose-400/30 bg-rose-500/15 px-4 py-3 text-sm text-rose-300">{error}</p>
          )}

          {itLoading ? (
            <div className="flex justify-center py-16"><Spinner size="lg" /></div>
          ) : itCategories.length === 0 ? (
            <p className="text-sm text-slate-400 dark:text-white/30">{t('common.noData')}</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {itCategories.map((cat, idx) => {
                const palette = IT_GRADIENT_PALETTE[idx % IT_GRADIENT_PALETTE.length];
                const studyKey = `${cat.name}-study`;
                return (
                  <div key={cat.id} className={clsx('glass-card rounded-2xl p-5 shadow-xl', palette.glow)}>
                    <div className={clsx(
                      'mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br text-lg font-extrabold text-white shadow-lg',
                      palette.gradientFrom, palette.gradientTo, palette.glow,
                    )}>
                      {cat.name.slice(0, 2)}
                    </div>
                    <h2 className="mb-1 text-lg font-bold text-slate-900 dark:text-white">{cat.name}</h2>
                    <p className="mb-5 text-xs text-slate-500 dark:text-white/50">{t('exam.it.subtitle')}</p>
                    <div className="flex flex-col gap-2">
                      <Button
                        label={starting !== null ? '…' : t('exam.examMode')}
                        disabled={starting !== null}
                        onClick={() => setPendingExam({ category: cat.name, isReading: false, questionTypes: [], sectionId: cat.name })}
                      />
                      <Button
                        label={starting === studyKey ? '…' : t('exam.studyMode')}
                        variant="secondary"
                        disabled={starting !== null}
                        onClick={() => handleStart(cat.name, 'study', false, undefined, ALL_QUESTIONS_SENTINEL)}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Count picker modal for IT exam mode */}
          <Modal
            isOpen={pendingExam !== null}
            title={t('exam.selectCountTitle')}
            onClose={() => setPendingExam(null)}
          >
            {pendingExam && (
              <div className="space-y-5">
                <div className="flex flex-wrap gap-2">
                  {COUNT_OPTIONS.map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setCount(pendingExam.sectionId, n)}
                      className={clsx(
                        'rounded-xl border px-5 py-2.5 text-sm font-semibold transition-all',
                        getCount(pendingExam.sectionId) === n
                          ? 'border-amber-400/50 bg-amber-500 text-white shadow-md'
                          : 'border-slate-200 dark:border-white/10 bg-black/5 dark:bg-white/5 text-slate-600 dark:text-white/60 hover:bg-black/8 dark:hover:bg-white/10',
                      )}
                    >
                      {n === ALL_QUESTIONS_SENTINEL ? t('exam.numQuestionsAll') : n}
                    </button>
                  ))}
                </div>
                <Button
                  label={starting !== null ? '…' : t('exam.startExam')}
                  disabled={starting !== null}
                  onClick={handleConfirmExam}
                  className="w-full"
                />
              </div>
            )}
          </Modal>
        </>
      )}
    </PageShell>
  );
};

// ── Full Exam Tab ─────────────────────────────────────────────────────────────

interface FullExamTabProps {
  level: JLPTLevel;
  starting: string | null;
  onStart: (category: string, mode: ExamMode, isReading: boolean, questionTypes?: string[], count?: number) => void;
  counts: Record<string, number | null>;
  loading: boolean;
  t: (key: string, opts?: Record<string, unknown>) => string;
}

const FullExamTab = ({ level, starting, onStart, counts, loading, t }: FullExamTabProps) => {
  const times = FULL_EXAM_TIMES[level];
  const isCombined = 'combined' in times;

  if (loading) {
    return <div className="flex justify-center py-16"><Spinner size="lg" /></div>;
  }

  if (isCombined) {
    const category  = jlptFullCategory(level);
    const examKey   = `${category}-exam`;
    const studyKey  = `${category}-study`;
    const total     = counts['full'] ?? null;
    const isEmpty   = total === 0;

    return (
      <div className="max-w-lg">
        <div className="glass-card rounded-2xl p-6 shadow-xl">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 text-xl font-bold text-white shadow-lg">
              全
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">{t('exam.jlpt.fullExamTitle')}</h2>
              <p className="text-xs text-slate-500 dark:text-white/50">{t('exam.jlpt.fullExamCombinedDesc')}</p>
            </div>
          </div>
          <div className="mb-5 flex flex-wrap gap-2">
            <span className="rounded-full border border-amber-300/50 bg-amber-100 dark:bg-amber-500/15 px-2.5 py-0.5 text-xs font-semibold text-amber-700 dark:text-amber-300">
              {t('exam.jlpt.vocabSection')}
            </span>
            <span className="rounded-full border border-emerald-300/50 bg-emerald-100 dark:bg-emerald-500/15 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
              {t('exam.jlpt.grammarSection')}
            </span>
            <span className="rounded-full border border-slate-200 dark:border-white/15 bg-slate-100 dark:bg-white/8 px-2.5 py-0.5 text-xs font-semibold text-slate-600 dark:text-white/55">
              {fmt(times.combined!)}
            </span>
            {total !== null && (
              <span className={clsx(
                'rounded-full px-2.5 py-0.5 text-xs font-semibold',
                isEmpty
                  ? 'bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400'
                  : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400',
              )}>
                {total} {t('exam.questionCount', { count: total })}
              </span>
            )}
          </div>
          {isEmpty ? (
            <div className="flex flex-col gap-2 rounded-xl border border-dashed border-rose-200 dark:border-rose-500/30 bg-rose-50 dark:bg-rose-500/10 px-4 py-4">
              <p className="text-sm font-medium text-rose-600 dark:text-rose-400">{t('common.noQuestionsAvailable')}</p>
              <p className="text-xs text-rose-400 dark:text-rose-500">{t('exam.jlpt.fullExamNoDataHint')}</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <Button
                label={starting === examKey ? '…' : t('exam.examMode')}
                disabled={starting !== null}
                onClick={() => onStart(category, 'exam', true, [], ALL_QUESTIONS_SENTINEL)}
              />
              <Button
                label={starting === studyKey ? '…' : t('exam.studyMode')}
                variant="secondary"
                disabled={starting !== null}
                onClick={() => onStart(category, 'study', true, [], ALL_QUESTIONS_SENTINEL)}
              />
            </div>
          )}
        </div>
      </div>
    );
  }

  // Separate papers for N3/N4/N5
  const papers = [
    {
      key:      'paper1',
      countKey: 'vocab',
      icon:     '語',
      titleKey: 'exam.jlpt.fullExamPaper1',
      descKey:  'exam.jlpt.vocabSection',
      category: jlptVocabCategory(level),
      isReading: false,
      time:     times.vocab!,
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      key:      'paper2',
      countKey: 'grammar',
      icon:     '読',
      titleKey: 'exam.jlpt.fullExamPaper2',
      descKey:  'exam.jlpt.grammarSection',
      category: jlptGrammarCategory(level),
      isReading: true,
      time:     times.grammar!,
      gradient: 'from-rose-500 to-pink-500',
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {papers.map((paper) => {
        const examKey  = `${paper.category}-exam`;
        const studyKey = `${paper.category}-study`;
        const total    = counts[paper.countKey] ?? null;
        const isEmpty  = total === 0;
        return (
          <div key={paper.key} className="glass-card rounded-2xl p-5 shadow-xl">
            <div className={clsx(
              'mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br text-2xl font-bold text-white shadow-lg',
              paper.gradient,
            )}>
              {paper.icon}
            </div>
            <div className="mb-1 flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">{t(paper.titleKey)}</h2>
              {total !== null && (
                <span className={clsx(
                  'rounded-full px-2 py-0.5 text-xs font-semibold',
                  isEmpty
                    ? 'bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400'
                    : 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300',
                )}>
                  {total}
                </span>
              )}
            </div>
            <p className="mb-2 text-xs text-slate-500 dark:text-white/50">{t(paper.descKey)}</p>
            <span className="mb-4 inline-block rounded-full border border-slate-200 dark:border-white/15 bg-slate-100 dark:bg-white/8 px-2.5 py-0.5 text-xs font-semibold text-slate-600 dark:text-white/55">
              {fmt(paper.time)}
            </span>
            {isEmpty ? (
              <div className="flex flex-col gap-1 rounded-xl border border-dashed border-rose-200 dark:border-rose-500/30 bg-rose-50 dark:bg-rose-500/10 px-4 py-3">
                <p className="text-sm font-medium text-rose-600 dark:text-rose-400">{t('common.noQuestionsAvailable')}</p>
                <p className="text-xs text-rose-400 dark:text-rose-500">{t('exam.jlpt.fullExamNoDataHint')}</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <Button
                  label={starting === examKey ? '…' : t('exam.examMode')}
                  disabled={starting !== null}
                  onClick={() => onStart(paper.category, 'exam', paper.isReading, [], ALL_QUESTIONS_SENTINEL)}
                />
                <Button
                  label={starting === studyKey ? '…' : t('exam.studyMode')}
                  variant="secondary"
                  disabled={starting !== null}
                  onClick={() => onStart(paper.category, 'study', paper.isReading, [], ALL_QUESTIONS_SENTINEL)}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

// ── Drill Section ─────────────────────────────────────────────────────────────

interface DrillSectionProps {
  titleKey: string;
  sectionId: string;
  mondai: readonly string[];
  counts: Record<string, number>;
  selected: Record<string, boolean>;
  onToggle: (sectionId: string, type: string) => void;
  onStart: (mode: ExamMode) => void;
  starting: string | null;
  category: string;
  selectedTypes: string[];
  t: (key: string, opts?: Record<string, unknown>) => string;
}

const DrillSection = ({
  titleKey, sectionId, mondai, counts, selected, onToggle, onStart, starting, category, selectedTypes, t,
}: DrillSectionProps) => {
  const hasSelection = selectedTypes.length > 0;
  const examKey  = `${category}-${selectedTypes.join(',')}-exam`;
  const studyKey = `${category}-${selectedTypes.join(',')}-study`;

  return (
    <div className="glass-card rounded-2xl p-5 shadow-xl">
      <h2 className="mb-3 text-sm font-semibold text-slate-700 dark:text-white/80">{t(titleKey)}</h2>
      <p className="mb-4 text-xs text-slate-400 dark:text-white/40">{t('exam.jlpt.drillSelectHint')}</p>

      <div className="mb-5 flex flex-wrap gap-2">
        {mondai.map((type) => {
          const count = counts[type] ?? 0;
          const isSelected = !!selected[`${sectionId}:${type}`];
          return (
            <button
              key={type}
              onClick={() => onToggle(sectionId, type)}
              className={clsx(
                'flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all',
                isSelected
                  ? 'border-amber-400/50 bg-amber-500/20 text-amber-800 dark:text-amber-300'
                  : count === 0
                    ? 'border-slate-200 dark:border-white/10 bg-black/3 dark:bg-white/3 text-slate-300 dark:text-white/20 cursor-not-allowed opacity-50'
                    : 'border-slate-200 dark:border-white/10 bg-black/5 dark:bg-white/5 text-slate-600 dark:text-white/60 hover:border-amber-300/50 hover:bg-amber-500/10 hover:text-amber-800 dark:hover:text-amber-300',
              )}
              disabled={count === 0}
            >
              {type}
              <span className={clsx(
                'rounded-full px-1.5 py-px text-[10px] font-bold',
                isSelected
                  ? 'bg-amber-400/30 text-amber-700 dark:text-amber-200'
                  : 'bg-slate-100 dark:bg-white/10 text-slate-400 dark:text-white/30',
              )}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {hasSelection ? (
        <div className="flex gap-2">
          <Button
            label={starting === examKey ? '…' : t('exam.jlpt.drillStartExam')}
            disabled={starting !== null}
            onClick={() => onStart('exam')}
          />
          <Button
            label={starting === studyKey ? '…' : t('exam.jlpt.drillStartStudy')}
            variant="secondary"
            disabled={starting !== null}
            onClick={() => onStart('study')}
          />
        </div>
      ) : (
        <p className="text-xs text-slate-400 dark:text-white/30">{t('exam.jlpt.drillNoneSelected')}</p>
      )}
    </div>
  );
};

export default ExamSelect;
