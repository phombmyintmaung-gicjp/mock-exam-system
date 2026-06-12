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
  color: string;
  border: string;
  iconBg: string;
  isReading: boolean;
}

const TEST_TYPES: TestTypeConfig[] = [
  { id: '文字語彙', labelKey: 'exam.jlpt.mojiGoi',   descKey: 'exam.jlpt.mojiGoiDesc',   icon: '語', color: 'text-blue-600',   border: 'border-blue-200',   iconBg: 'bg-blue-100',   isReading: false },
  { id: '文法読解', labelKey: 'exam.jlpt.bunpoKaido', descKey: 'exam.jlpt.bunpoKaidoDesc', icon: '文', color: 'text-green-600',  border: 'border-green-200',  iconBg: 'bg-green-100',  isReading: true  },
];

const LEVEL_COLORS: Record<JLPTLevel, { tab: string; active: string }> = {
  N1: { tab: 'border-rose-400 text-rose-700 bg-rose-50',   active: 'bg-rose-500 text-white border-rose-500' },
  N2: { tab: 'border-orange-400 text-orange-700 bg-orange-50', active: 'bg-orange-500 text-white border-orange-500' },
  N3: { tab: 'border-yellow-400 text-yellow-700 bg-yellow-50', active: 'bg-yellow-500 text-white border-yellow-500' },
  N4: { tab: 'border-green-400 text-green-700 bg-green-50',  active: 'bg-green-500 text-white border-green-500' },
  N5: { tab: 'border-blue-400 text-blue-700 bg-blue-50',    active: 'bg-blue-500 text-white border-blue-500' },
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

  const colors = LEVEL_COLORS[selectedLevel];

  return (
    <PageShell>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">{t('exam.jlpt.title')}</h1>
        <p className="mt-1 text-sm text-slate-500">{t('exam.jlpt.subtitle')}</p>
      </div>

      {/* Level tabs */}
      <div className="mb-6 flex gap-2 overflow-x-auto pb-1">
        {LEVELS.map((level) => {
          const lc = LEVEL_COLORS[level];
          const isActive = level === selectedLevel;
          return (
            <button
              key={level}
              onClick={() => setSelectedLevel(level)}
              className={clsx(
                'min-w-[64px] rounded-xl border-2 px-5 py-2.5 text-sm font-bold transition-all',
                isActive ? lc.active : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-700',
              )}
            >
              {level}
            </button>
          );
        })}
      </div>

      {error && (
        <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
      )}

      {/* Test type cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        {TEST_TYPES.map((tt) => {
          const examKey  = `JLPT-${selectedLevel}-${tt.id}-exam`;
          const studyKey = `JLPT-${selectedLevel}-${tt.id}-study`;
          return (
            <div key={tt.id} className={clsx('rounded-xl border-2 bg-white p-5 shadow-sm', tt.border)}>
              <div className={clsx('mb-3 flex h-12 w-12 items-center justify-center rounded-xl text-2xl font-bold', tt.iconBg, tt.color)}>
                {tt.icon}
              </div>
              <h2 className={clsx('mb-1 text-lg font-bold', tt.color)}>{t(tt.labelKey)}</h2>
              <p className="mb-4 text-xs text-slate-500">{t(tt.descKey)}</p>
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
        <span className={clsx('rounded-full border-2 px-4 py-1 text-sm font-bold', colors.active)}>
          {selectedLevel}
        </span>
        <span className="text-sm text-slate-500">{t('exam.jlpt.levelSelected', { level: selectedLevel })}</span>
      </div>
    </PageShell>
  );
};

export default ExamSelect;
