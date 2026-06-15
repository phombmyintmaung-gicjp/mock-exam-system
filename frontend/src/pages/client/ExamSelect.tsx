import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { clsx } from 'clsx';
import { PageShell } from '@/components/layout/PageShell';
import { Button } from '@/components/ui/Button';
import { startExamSession } from '@/services/examService';
import { useExamSessionStore } from '@/store/examSessionStore';
import type { ExamMode, JLPTLevel, JLPTTestType } from '@/types/exam';

const LEVELS: JLPTLevel[] = ['N1', 'N2', 'N3', 'N4', 'N5'];

interface TestTypeConfig {
  id: JLPTTestType;
  labelKey: string;
  descKey: string;
  icon: string;
  gradientFrom: string;
  gradientTo: string;
  glow: string;
  isReading: boolean;
}

const TEST_TYPES: TestTypeConfig[] = [
  {
    id: '文字語彙',
    labelKey: 'exam.jlpt.mojiGoi',
    descKey: 'exam.jlpt.mojiGoiDesc',
    icon: '語',
    gradientFrom: 'from-blue-500',
    gradientTo: 'to-cyan-500',
    glow: 'shadow-blue-500/20',
    isReading: false,
  },
  {
    id: '文法読解',
    labelKey: 'exam.jlpt.bunpoKaido',
    descKey: 'exam.jlpt.bunpoKaidoDesc',
    icon: '文',
    gradientFrom: 'from-violet-500',
    gradientTo: 'to-purple-500',
    glow: 'shadow-violet-500/20',
    isReading: true,
  },
];

const LEVEL_GRADIENTS: Record<JLPTLevel, { active: string; glow: string }> = {
  N1: { active: 'from-rose-500 to-pink-500',     glow: 'shadow-rose-500/30' },
  N2: { active: 'from-orange-500 to-amber-500',  glow: 'shadow-orange-500/30' },
  N3: { active: 'from-yellow-500 to-amber-400',  glow: 'shadow-yellow-500/30' },
  N4: { active: 'from-emerald-500 to-teal-500',  glow: 'shadow-emerald-500/30' },
  N5: { active: 'from-blue-500 to-indigo-500',   glow: 'shadow-blue-500/30' },
};

const ExamSelect = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const setSession = useExamSessionStore((s) => s.setSession);

  const [selectedLevel, setSelectedLevel] = useState<JLPTLevel>('N5');
  const [starting, setStarting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleStart = async (testType: JLPTTestType, mode: ExamMode) => {
    const category = `JLPT-${selectedLevel}-${testType}`;
    const key = `${category}-${mode}`;
    setStarting(key);
    setError(null);
    try {
      const session = await startExamSession(category, mode);
      setSession({
        sessionId: session.sessionId,
        mode: session.mode,
        questions: session.questions,
        currentIndex: 0,
        answers: {},
        flagged: new Set(),
        secondsRemaining: session.timeLimitSeconds,
      });
      const isReading = TEST_TYPES.find((t) => t.id === testType)?.isReading ?? false;
      if (isReading) {
        navigate('/reading/session');
      } else {
        navigate(mode === 'exam' ? '/exam/session' : '/study/session');
      }
    } catch {
      setError(t('common.error'));
    } finally {
      setStarting(null);
    }
  };

  const levelGrad = LEVEL_GRADIENTS[selectedLevel];

  return (
    <PageShell>
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

      {/* Test type cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        {TEST_TYPES.map((tt) => {
          const examKey  = `JLPT-${selectedLevel}-${tt.id}-exam`;
          const studyKey = `JLPT-${selectedLevel}-${tt.id}-study`;
          return (
            <div key={tt.id} className={clsx('glass-card rounded-2xl p-5 shadow-xl', tt.glow)}>
              <div className={clsx(
                'mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br text-2xl font-bold text-white shadow-lg',
                tt.gradientFrom, tt.gradientTo, tt.glow,
              )}>
                {tt.icon}
              </div>
              <h2 className="mb-1 text-lg font-bold text-slate-900 dark:text-white">{t(tt.labelKey)}</h2>
              <p className="mb-5 text-xs text-slate-500 dark:text-white/50">{t(tt.descKey)}</p>
              <div className="flex flex-col gap-2">
                <Button
                  label={starting === examKey ? '…' : t('exam.examMode')}
                  disabled={starting !== null}
                  onClick={() => handleStart(tt.id, 'exam')}
                />
                <Button
                  label={starting === studyKey ? '…' : t('exam.studyMode')}
                  variant="secondary"
                  disabled={starting !== null}
                  onClick={() => handleStart(tt.id, 'study')}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Level badge */}
      <div className="mt-6 flex items-center gap-2">
        <span className={clsx(
          'rounded-full bg-gradient-to-r px-4 py-1 text-sm font-bold text-white shadow-md',
          levelGrad.active, levelGrad.glow,
        )}>
          {selectedLevel}
        </span>
        <span className="text-sm text-slate-400 dark:text-white/45">{t('exam.jlpt.levelSelected', { level: selectedLevel })}</span>
      </div>
    </PageShell>
  );
};

export default ExamSelect;
