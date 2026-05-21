import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { PageShell } from '@/components/layout/PageShell';
import { Button } from '@/components/ui/Button';
import { startExamSession } from '@/services/examService';
import { useExamSessionStore } from '@/store/examSessionStore';
import type { ExamMode } from '@/types/exam';

const categories = [
  {
    id: 'AWS',
    name: 'AWS',
    description: 'Amazon Web Services Certification',
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    iconBg: 'bg-orange-100',
    iconText: 'text-orange-600',
  },
  {
    id: 'Network',
    name: 'Network',
    description: 'Networking fundamentals',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    iconBg: 'bg-blue-100',
    iconText: 'text-blue-600',
  },
  {
    id: 'Security',
    name: 'Security',
    description: 'Information security',
    bg: 'bg-red-50',
    border: 'border-red-200',
    iconBg: 'bg-red-100',
    iconText: 'text-red-600',
  },
  {
    id: 'Linux',
    name: 'Linux',
    description: 'Linux administration',
    bg: 'bg-green-50',
    border: 'border-green-200',
    iconBg: 'bg-green-100',
    iconText: 'text-green-600',
  },
];

const ExamSelect = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const setSession = useExamSessionStore((s) => s.setSession);
  const [starting, setStarting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleStart = async (categoryId: string, mode: ExamMode) => {
    setStarting(`${categoryId}-${mode}`);
    setError(null);
    try {
      const session = await startExamSession(categoryId, mode);
      setSession({
        sessionId: session.sessionId,
        questions: session.questions,
        currentIndex: 0,
        answers: {},
        flagged: new Set(),
        secondsRemaining: session.timeLimitSeconds,
      });
      navigate(mode === 'exam' ? '/exam/session' : '/study/session');
    } catch {
      setError(t('common.error'));
    } finally {
      setStarting(null);
    }
  };

  return (
    <PageShell>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{t('exam.selectTitle')}</h1>
        <p className="mt-1 text-sm text-gray-500">{t('exam.selectSubtitle')}</p>
      </div>

      {error && (
        <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((cat) => {
          const loadingExam = starting === `${cat.id}-exam`;
          const loadingStudy = starting === `${cat.id}-study`;
          return (
            <div key={cat.id} className={`rounded-xl border p-6 shadow-sm ${cat.bg} ${cat.border}`}>
              <div className="mb-4">
                <h2 className="text-xl font-bold text-gray-900">{cat.name}</h2>
                <p className="mt-0.5 text-sm text-gray-600">{cat.description}</p>
              </div>
              <div className="flex gap-2">
                <Button
                  label={loadingExam ? '…' : t('exam.examMode')}
                  disabled={starting !== null}
                  onClick={() => handleStart(cat.id, 'exam')}
                />
                <Button
                  label={loadingStudy ? '…' : t('exam.studyMode')}
                  variant="secondary"
                  disabled={starting !== null}
                  onClick={() => handleStart(cat.id, 'study')}
                />
              </div>
            </div>
          );
        })}
      </div>
    </PageShell>
  );
};

export default ExamSelect;
