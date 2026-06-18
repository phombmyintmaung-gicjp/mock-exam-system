import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { clsx } from 'clsx';
import { PageShell } from '@/components/layout/PageShell';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { QuestionCard } from '@/components/shared/QuestionCard';
import { getAdminQuestion, createQuestion, updateQuestion } from '@/services/questionService';
import { getCategories, createCategory } from '@/services/categoryService';
import { MONDAI_VOCAB, MONDAI_GRAMMAR } from '@/constants';
import type { Question } from '@/types/exam';
import type { Category } from '@/types/category';

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

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const [previewSelected, setPreviewSelected] = useState<number | undefined>(undefined);
  const [previewRevealed, setPreviewRevealed] = useState(false);

  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState<number | ''>('');
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isAddingCategory, setIsAddingCategory] = useState(false);

  const [text, setText] = useState('');
  const [questionType, setQuestionType] = useState('');
  const [explanation, setExplanation] = useState('');
  const [choices, setChoices] = useState<ChoiceField[]>(emptyChoices());

  useEffect(() => {
    const loadData = async () => {
      // Load categories — graceful failure so the form still renders
      let cats: Category[] = [];
      try {
        cats = await getCategories();
        setCategories(cats);
      } catch {
        // Categories table may not be migrated yet; continue with empty list
      }

      if (isEdit && id) {
        try {
          const q = await getAdminQuestion(Number(id));
          setText(q.text);
          setExplanation(q.explanation ?? '');

          // 1. Try category_id from the raw backend response first
          const rawCategoryId = (q as unknown as { category_id?: number | null }).category_id;
          if (rawCategoryId) {
            setCategoryId(rawCategoryId);
          } else {
            // 2. Fall back to name match
            const matched = cats.find((c) => c.name === q.category);
            if (matched) {
              setCategoryId(matched.id);
            } else if (q.category) {
              // 3. No match — pre-open new-category input with the existing name
              setShowNewCategory(true);
              setNewCategoryName(q.category);
            }
          }

          setQuestionType((q as unknown as { question_type?: string | null }).question_type ?? '');

          if (q.choices.length > 0) {
            setChoices(
              q.choices.map((c, i) => ({
                text: c.text,
                is_correct: !!(c as unknown as { is_correct?: boolean }).is_correct,
                order: i,
              })),
            );
          }
        } catch {
          setError(t('common.error'));
        }
      }

      setIsLoading(false);
    };
    loadData();
  }, [id, isEdit, t]);

  const handleAddCategory = async () => {
    const name = newCategoryName.trim();
    if (!name) return;
    setIsAddingCategory(true);
    try {
      const created = await createCategory(name);
      setCategories((prev) => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)));
      setCategoryId(created.id);
      setShowNewCategory(false);
      setNewCategoryName('');
    } catch {
      setError(t('common.error'));
    } finally {
      setIsAddingCategory(false);
    }
  };

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
    if (!categoryId) {
      setError(t('admin.questionForm.categoryRequired'));
      return;
    }
    setIsSaving(true);
    setError(null);
    const payload = {
      text,
      category_id: categoryId,
      question_type: questionType || null,
      explanation,
      choices,
    };
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

  const switchToPreview = () => {
    setPreviewSelected(undefined);
    setPreviewRevealed(false);
    setActiveTab('preview');
  };

  const selectedCategoryName = categories.find((c) => c.id === categoryId)?.name ?? '';

  const isJlpt = selectedCategoryName.startsWith('JLPT-');
  const mondaiOptions: readonly string[] = selectedCategoryName.includes('文字語彙')
    ? MONDAI_VOCAB
    : MONDAI_GRAMMAR;

  const previewQuestion: Question = {
    id: 0,
    text: text || t('admin.questionForm.previewEmpty'),
    category: selectedCategoryName,
    choices: choices.map((c, i) => ({
      id: i,
      text: c.text || `Choice ${i + 1}`,
      isCorrect: c.is_correct,
    })),
    explanation: explanation || undefined,
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
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('admin.questionForm.title')}</h1>
          <p className="mt-1 text-sm text-gray-500">{t('admin.questionForm.subtitle')}</p>
        </div>
        <div className="flex overflow-hidden rounded-lg border border-gray-200 self-start">
          <button
            type="button"
            onClick={() => setActiveTab('edit')}
            className={clsx(
              'px-4 py-2 text-sm font-medium transition-colors',
              activeTab === 'edit'
                ? 'bg-amber-500 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50',
            )}
          >
            {t('admin.questionForm.editTab')}
          </button>
          <button
            type="button"
            onClick={switchToPreview}
            className={clsx(
              'px-4 py-2 text-sm font-medium transition-colors',
              activeTab === 'preview'
                ? 'bg-amber-500 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50',
            )}
          >
            {t('admin.questionForm.previewTab')}
          </button>
        </div>
      </div>

      {activeTab === 'edit' ? (
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
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                placeholder={t('admin.questionForm.questionTextPlaceholder')}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">{t('admin.questionForm.category')}</label>
                <select
                  required
                  value={categoryId}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === '__new__') {
                      setShowNewCategory(true);
                    } else {
                      const newId = Number(val);
                      const newCatName = categories.find((c) => c.id === newId)?.name ?? '';
                      if (!newCatName.startsWith('JLPT-')) setQuestionType('');
                      setCategoryId(newId);
                    }
                  }}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-700 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                >
                  <option value="">{t('admin.questionForm.categoryPlaceholder')}</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                  <option value="__new__">{t('admin.questionForm.newCategoryLabel')}</option>
                </select>
                {showNewCategory && (
                  <div className="mt-2 flex gap-2">
                    <input
                      type="text"
                      autoFocus
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCategory())}
                      placeholder={t('admin.questionForm.newCategoryPlaceholder')}
                      className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                    <button
                      type="button"
                      onClick={handleAddCategory}
                      disabled={isAddingCategory || !newCategoryName.trim()}
                      className="rounded-lg bg-amber-500 px-3 py-2 text-sm font-medium text-white hover:bg-amber-600 disabled:opacity-50"
                    >
                      {t('admin.questionForm.newCategoryAdd')}
                    </button>
                    <button
                      type="button"
                      onClick={() => { setShowNewCategory(false); setNewCategoryName(''); }}
                      className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50"
                    >
                      {t('admin.questionForm.newCategoryCancel')}
                    </button>
                  </div>
                )}
              </div>
              {isJlpt && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">{t('admin.questionForm.questionType')}</label>
                  <select
                    value={questionType}
                    onChange={(e) => setQuestionType(e.target.value)}
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-700 focus:border-amber-500 focus:outline-none"
                  >
                    <option value="">{t('admin.questionForm.questionTypePlaceholder')}</option>
                    {mondaiOptions.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">{t('admin.questionForm.explanation')}</label>
              <textarea
                rows={3}
                required
                value={explanation}
                onChange={(e) => setExplanation(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
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
                      className="h-4 w-4 shrink-0 accent-amber-500"
                      title={t('admin.questionForm.markCorrect')}
                    />
                    <input
                      type="text"
                      required
                      value={choice.text}
                      onChange={(e) => updateChoice(idx, e.target.value)}
                      placeholder={t('admin.questionForm.choicePlaceholder', { number: idx + 1 })}
                      className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
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
              <Button label={isSaving ? t('common.saving') : t('admin.questionForm.saveButton')} type="submit" disabled={isSaving} />
            </div>
          </div>
        </form>
      ) : (
        <div className="w-full max-w-2xl space-y-3">
          <p className="text-xs text-gray-400">{t('admin.questionForm.previewHint')}</p>
          <QuestionCard
            question={previewQuestion}
            selectedChoiceId={previewSelected}
            onSelect={(choiceId) => {
              setPreviewSelected(choiceId);
              setPreviewRevealed(false);
            }}
            revealed={previewRevealed}
          />
          {previewSelected !== undefined && !previewRevealed && (
            <div className="flex justify-center">
              <Button
                label={t('admin.questionForm.revealAnswer')}
                variant="secondary"
                type="button"
                onClick={() => setPreviewRevealed(true)}
              />
            </div>
          )}
          {previewRevealed && previewQuestion.explanation && (
            <div className="rounded-xl border border-amber-400/25 bg-amber-500/10 px-4 py-3 text-sm text-amber-900 dark:text-amber-200">
              <span className="mr-1 font-semibold text-amber-700 dark:text-amber-300">{t('result.review.explanation')}:</span>
              {previewQuestion.explanation}
            </div>
          )}
          {previewRevealed && (
            <div className="flex justify-center">
              <Button
                label={t('admin.questionForm.resetPreview')}
                variant="secondary"
                type="button"
                onClick={() => { setPreviewSelected(undefined); setPreviewRevealed(false); }}
              />
            </div>
          )}
        </div>
      )}
    </PageShell>
  );
};

export default QuestionForm;
