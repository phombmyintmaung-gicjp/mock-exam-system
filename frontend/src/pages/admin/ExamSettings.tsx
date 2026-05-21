import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { PageShell } from '@/components/layout/PageShell';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { fetchExamSettings, updateExamSetting } from '@/services/examSettingsService';
import type { CategoryExamSetting } from '@/types/exam';

interface CardState {
  category: string;
  timeLimitMinutes: number;
  questionCount: number;
  passingScore: number;
  saving: boolean;
  message: { type: 'success' | 'error'; text: string } | null;
}

function toCardState(s: CategoryExamSetting): CardState {
  return {
    category: s.category,
    timeLimitMinutes: s.time_limit_seconds === 0 ? 0 : Math.round(s.time_limit_seconds / 60),
    questionCount: s.question_count,
    passingScore: s.passing_score,
    saving: false,
    message: null,
  };
}

const ExamSettings = () => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);
  const [cards, setCards] = useState<CardState[]>([]);

  useEffect(() => {
    let cancelled = false;
    fetchExamSettings()
      .then((settings) => {
        if (!cancelled) setCards(settings.map(toCardState));
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setIsLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const updateCard = (index: number, patch: Partial<CardState>) => {
    setCards((prev) => prev.map((c, i) => (i === index ? { ...c, ...patch } : c)));
  };

  const handleSave = async (index: number) => {
    const card = cards[index];
    updateCard(index, { saving: true, message: null });
    try {
      await updateExamSetting(card.category, {
        time_limit_seconds: card.timeLimitMinutes * 60,
        question_count: card.questionCount,
        passing_score: card.passingScore,
      });
      updateCard(index, { saving: false, message: { type: 'success', text: t('admin.examSettings.saved') } });
    } catch {
      updateCard(index, { saving: false, message: { type: 'error', text: t('common.error') } });
    }
  };

  return (
    <PageShell>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{t('admin.examSettings.title')}</h1>
        <p className="mt-1 text-sm text-gray-500">{t('admin.examSettings.subtitle')}</p>
      </div>

      {isLoading ? (
        <div className="flex min-h-[30vh] items-center justify-center">
          <Spinner size="lg" />
        </div>
      ) : cards.length === 0 ? (
        <p className="text-sm text-gray-500">{t('common.noData')}</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2">
          {cards.map((card, index) => (
            <div key={card.category} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">{card.category}</h2>

              {card.message && (
                <p className={`mb-4 rounded-lg px-4 py-2.5 text-sm ${card.message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                  {card.message.text}
                </p>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    {t('admin.examSettings.timeLimit')}
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={300}
                    value={card.timeLimitMinutes}
                    onChange={(e) => updateCard(index, { timeLimitMinutes: Number(e.target.value), message: null })}
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    {t('admin.examSettings.questionCount')}
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={200}
                    value={card.questionCount}
                    onChange={(e) => updateCard(index, { questionCount: Number(e.target.value), message: null })}
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    {t('admin.examSettings.passingScore')}
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={card.passingScore}
                    onChange={(e) => updateCard(index, { passingScore: Number(e.target.value), message: null })}
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div className="flex justify-end pt-1">
                  <Button
                    label={card.saving ? t('common.saving') : t('admin.examSettings.saveButton')}
                    disabled={card.saving}
                    onClick={() => handleSave(index)}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </PageShell>
  );
};

export default ExamSettings;
