import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { PageShell } from '@/components/layout/PageShell';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { getAdminQuestion, createQuestion, updateQuestion } from '@/services/questionService';

interface ChoiceField {
  text: string;
  is_correct: boolean;
  order: number;
}

const emptyChoices = (): ChoiceField[] => [
  { text: '', is_correct: true,  order: 0 },
  { text: '', is_correct: false, order: 1 },
  { text: '', is_correct: false, order: 2 },
  { text: '', is_correct: false, order: 3 },
];

const QuestionForm = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);

  const [isLoading, setIsLoading] = useState(isEdit);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [text, setText] = useState('');
  const [category, setCategory] = useState('');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [explanation, setExplanation] = useState('');
  const [choices, setChoices] = useState<ChoiceField[]>(emptyChoices());

  useEffect(() => {
    if (!isEdit || !id) return;
    getAdminQuestion(Number(id))
      .then((q) => {
        setText(q.text);
        setCategory(q.category);
        setDifficulty(q.difficulty);
        setExplanation(q.explanation ?? '');
        if (q.choices.length > 0) {
          setChoices(
            q.choices.map((c, i) => ({
              text: c.text,
              is_correct: !!(c as unknown as { is_correct?: boolean }).is_correct,
              order: i,
            })),
          );
        }
      })
      .catch(() => setError(t('common.error')))
      .finally(() => setIsLoading(false));
  }, [id, isEdit, t]);

  const setCorrect = (idx: number) => {
    setChoices((prev) => prev.map((c, i) => ({ ...c, is_correct: i === idx })));
  };

  const updateChoice = (idx: number, value: string) => {
    setChoices((prev) => prev.map((c, i) => (i === idx ? { ...c, text: value } : c)));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!choices.some((c) => c.is_correct)) {
      setError(t('admin.questionForm.noCorrectAnswer'));
      return;
    }
    setIsSaving(true);
    setError(null);
    const payload = { text, category, difficulty, explanation, choices };
    try {
      if (isEdit && id) {
        await updateQuestion(Number(id), payload);
      } else {
        await createQuestion(payload);
      }
      navigate('/admin/questions');
    } catch {
      setError(t('common.error'));
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <PageShell>
        <div className="flex min-h-[40vh] items-center justify-center">
          <Spinner size="lg" />
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{t('admin.questionForm.title')}</h1>
        <p className="mt-1 text-sm text-gray-500">{t('admin.questionForm.subtitle')}</p>
      </div>

      <form onSubmit={handleSubmit} className="w-full max-w-2xl rounded-xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
        {error && <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">{t('admin.questionForm.questionText')}</label>
            <textarea
              rows={4}
              required
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder={t('admin.questionForm.questionTextPlaceholder')}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">{t('admin.questionForm.category')}</label>
              <input
                type="text"
                required
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder={t('admin.questionForm.categoryPlaceholder')}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">{t('admin.questionForm.difficulty')}</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as 'easy' | 'medium' | 'hard')}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-700 focus:border-blue-500 focus:outline-none"
              >
                <option value="easy">{t('common.difficulty.easy')}</option>
                <option value="medium">{t('common.difficulty.medium')}</option>
                <option value="hard">{t('common.difficulty.hard')}</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">{t('admin.questionForm.explanation')}</label>
            <textarea
              rows={3}
              required
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder={t('admin.questionForm.explanationPlaceholder')}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">{t('admin.questionForm.choices')}</label>
            <p className="mb-3 text-xs text-gray-500">{t('admin.questionForm.choicesHint')}</p>
            <div className="space-y-3">
              {choices.map((choice, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="correct"
                    checked={choice.is_correct}
                    onChange={() => setCorrect(idx)}
                    className="h-4 w-4 shrink-0 accent-blue-600"
                    title={t('admin.questionForm.markCorrect')}
                  />
                  <input
                    type="text"
                    required
                    value={choice.text}
                    onChange={(e) => updateChoice(idx, e.target.value)}
                    placeholder={`${t('admin.questionForm.choicePlaceholder')} ${idx + 1}`}
                    className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  {choice.is_correct && (
                    <span className="shrink-0 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                      {t('result.correct')}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap justify-end gap-3">
            <Button label={t('common.cancel')} variant="secondary" type="button" onClick={() => navigate('/admin/questions')} />
            <Button label={isSaving ? t('common.saving') : t('admin.questionForm.saveButton')} disabled={isSaving} />
          </div>
        </div>
      </form>
    </PageShell>
  );
};

export default QuestionForm;
