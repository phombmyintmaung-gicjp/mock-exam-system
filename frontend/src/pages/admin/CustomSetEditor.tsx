import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { clsx } from 'clsx';
import { PageShell } from '@/components/layout/PageShell';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { Modal } from '@/components/ui/Modal';
import { XIcon, ChevronLeftIcon, ChevronRightIcon } from '@/components/ui/Icons';
import {
  getCustomSet,
  createCustomSet,
  updateCustomSet,
  addQuestionToSet,
  removeQuestionFromSet,
  createQuestionInSet,
  reorderSetQuestions,
} from '@/services/customSetService';
import api from '@/services/api';
import type { CustomSetDetail, CustomSetQuestion } from '@/types/customSet';
import type { AdminQuestion } from '@/types/exam';

interface ChoiceDraft {
  text: string;
  is_correct: boolean;
}

const DEFAULT_CHOICES: ChoiceDraft[] = [
  { text: '', is_correct: true },
  { text: '', is_correct: false },
  { text: '', is_correct: false },
  { text: '', is_correct: false },
];

const CustomSetEditor = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;

  // Metadata form
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [timeLimitMinutes, setTimeLimitMinutes] = useState(0);
  const [passingScore, setPassingScore] = useState(70);
  const [isActive, setIsActive] = useState(true);
  const [metaSaving, setMetaSaving] = useState(false);
  const [metaMsg, setMetaMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Questions state
  const [questions, setQuestions] = useState<CustomSetQuestion[]>([]);
  const [setId, setSetId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(isEdit);
  const [slug, setSlug] = useState('');

  // Add existing question modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [bankQuestions, setBankQuestions] = useState<AdminQuestion[]>([]);
  const [bankLoading, setBankLoading] = useState(false);
  const [bankSearch, setBankSearch] = useState('');
  const [addingId, setAddingId] = useState<number | null>(null);

  // Create new question modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newQText, setNewQText] = useState('');
  const [newQExplanation, setNewQExplanation] = useState('');
  const [newQChoices, setNewQChoices] = useState<ChoiceDraft[]>(DEFAULT_CHOICES);
  const [createSaving, setCreateSaving] = useState(false);
  const [createError, setCreateError] = useState('');

  const [removingId, setRemovingId] = useState<number | null>(null);
  const [copiedSlug, setCopiedSlug] = useState(false);

  const createdSetId = useRef<number | null>(null);

  // Load existing set
  useEffect(() => {
    if (!isEdit) return;
    getCustomSet(Number(id))
      .then((set) => {
        setName(set.name);
        setDescription(set.description ?? '');
        setTimeLimitMinutes(set.timeLimitSeconds === 0 ? 0 : Math.round(set.timeLimitSeconds / 60));
        setPassingScore(set.passingScore);
        setIsActive(set.isActive);
        setQuestions(set.questions);
        setSetId(set.id);
        setSlug(set.slug);
      })
      .catch(() => navigate('/admin/custom-sets'))
      .finally(() => setIsLoading(false));
  }, [id, isEdit, navigate]);

  // Load question bank when add modal opens
  useEffect(() => {
    if (!showAddModal || bankQuestions.length > 0) return;
    setBankLoading(true);
    api
      .get('/admin/questions', { params: { per_page: 500 } })
      .then((res) => setBankQuestions(res.data.data ?? []))
      .catch(() => {})
      .finally(() => setBankLoading(false));
  }, [showAddModal, bankQuestions.length]);

  const resolvedSetId = (): number | null => setId ?? createdSetId.current;

  const handleMetaSave = async () => {
    if (!name.trim()) return;
    setMetaSaving(true);
    setMetaMsg(null);
    try {
      const payload = {
        name: name.trim(),
        description: description.trim() || undefined,
        time_limit_seconds: timeLimitMinutes * 60,
        passing_score: passingScore,
        is_active: isActive,
      };
      if (isEdit && setId) {
        await updateCustomSet(setId, payload);
        setMetaMsg({ type: 'success', text: t('admin.customSets.saved') });
      } else {
        const created = await createCustomSet(payload);
        createdSetId.current = created.id;
        setSetId(created.id);
        setSlug((created as unknown as CustomSetDetail).slug ?? '');
        setMetaMsg({ type: 'success', text: t('admin.customSets.saved') });
      }
    } catch {
      setMetaMsg({ type: 'error', text: t('common.error') });
    } finally {
      setMetaSaving(false);
    }
  };

  const handleAddExisting = async (questionId: number) => {
    const sid = resolvedSetId();
    if (!sid) return;
    setAddingId(questionId);
    try {
      const updated = await addQuestionToSet(sid, questionId);
      setQuestions(updated.questions);
    } finally {
      setAddingId(null);
    }
  };

  const handleRemove = async (questionId: number) => {
    const sid = resolvedSetId();
    if (!sid) return;
    setRemovingId(questionId);
    try {
      await removeQuestionFromSet(sid, questionId);
      setQuestions((prev) => prev.filter((q) => q.id !== questionId));
    } finally {
      setRemovingId(null);
    }
  };

  const handleMove = async (index: number, dir: -1 | 1) => {
    const sid = resolvedSetId();
    if (!sid) return;
    const next = [...questions];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setQuestions(next);
    await reorderSetQuestions(sid, next.map((q) => q.id));
  };

  const handleCreateQuestion = async () => {
    const sid = resolvedSetId();
    if (!sid) return;
    const correctCount = newQChoices.filter((c) => c.is_correct).length;
    if (!newQText.trim()) { setCreateError(t('admin.customSets.newQuestion.noTextError')); return; }
    if (newQChoices.filter((c) => c.text.trim()).length < 2) { setCreateError(t('admin.customSets.newQuestion.minChoicesError')); return; }
    if (correctCount !== 1) { setCreateError(t('admin.customSets.newQuestion.noCorrectError')); return; }
    setCreateError('');
    setCreateSaving(true);
    try {
      await createQuestionInSet(sid, {
        text: newQText.trim(),
        explanation: newQExplanation.trim() || undefined,
        choices: newQChoices
          .filter((c) => c.text.trim())
          .map((c) => ({ text: c.text.trim(), is_correct: c.is_correct })),
      });
      // Reload questions
      const updated = await getCustomSet(sid);
      setQuestions(updated.questions);
      setShowCreateModal(false);
      setNewQText('');
      setNewQExplanation('');
      setNewQChoices(DEFAULT_CHOICES);
    } catch {
      setCreateError(t('common.error'));
    } finally {
      setCreateSaving(false);
    }
  };

  const setCorrectChoice = (idx: number) => {
    setNewQChoices((prev) => prev.map((c, i) => ({ ...c, is_correct: i === idx })));
  };

  const alreadyInSet = new Set(questions.map((q) => q.id));

  const filteredBank = bankSearch.trim()
    ? bankQuestions.filter(
        (q) =>
          q.text.toLowerCase().includes(bankSearch.toLowerCase()) ||
          q.category.toLowerCase().includes(bankSearch.toLowerCase()),
      )
    : bankQuestions;

  const handleCopyLink = () => {
    const url = `${window.location.origin}/exam/custom/${slug}`;
    const done = () => { setCopiedSlug(true); setTimeout(() => setCopiedSlug(false), 2000); };
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(done);
    } else {
      const el = document.createElement('textarea');
      el.value = url;
      el.style.position = 'fixed';
      el.style.opacity = '0';
      document.body.appendChild(el);
      el.focus();
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      done();
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
      {/* Header */}
      <div className="mb-6">
        <Link
          to="/admin/custom-sets"
          className="mb-3 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 dark:text-white/40 dark:hover:text-white/70"
        >
          <ChevronLeftIcon className="h-3.5 w-3.5" />
          {t('admin.customSets.backToList')}
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {isEdit ? t('admin.customSets.editSet') : t('admin.customSets.createSet')}
        </h1>
        {slug && (
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <span className="text-sm text-gray-500 dark:text-white/50">
              {t('admin.customSets.shareLink')}:{' '}
              <code className="rounded bg-gray-100 dark:bg-white/10 px-2 py-0.5 text-xs font-mono text-gray-700 dark:text-white/70">
                {`${window.location.origin}/exam/custom/${slug}`}
              </code>
            </span>
            <button
              onClick={handleCopyLink}
              className="text-sm font-medium text-amber-600 hover:text-amber-700 dark:text-amber-400"
            >
              {copiedSlug ? t('admin.customSets.linkCopied') : t('admin.customSets.copyLink')}
            </button>
          </div>
        )}
      </div>

      <div className="space-y-6">
        {/* Metadata card */}
        <div className="rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 p-6">
          <h2 className="mb-5 text-base font-semibold text-gray-900 dark:text-white">
            {t('admin.customSets.metadataSection')}
          </h2>

          {metaMsg && (
            <p
              className={`mb-4 rounded-lg px-4 py-2.5 text-sm ${
                metaMsg.type === 'success'
                  ? 'bg-green-50 text-green-700 dark:bg-emerald-500/15 dark:text-emerald-300'
                  : 'bg-red-50 text-red-600 dark:bg-rose-500/15 dark:text-rose-300'
              }`}
            >
              {metaMsg.text}
            </p>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-white/70">
                {t('admin.customSets.name')} <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('admin.customSets.namePlaceholder')}
                className="mt-1 block w-full rounded-lg border border-gray-300 dark:border-white/15 bg-white dark:bg-white/5 px-3 py-2.5 text-sm text-gray-900 dark:text-white focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-white/70">
                {t('admin.customSets.description')}
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t('admin.customSets.descriptionPlaceholder')}
                className="mt-1 block w-full rounded-lg border border-gray-300 dark:border-white/15 bg-white dark:bg-white/5 px-3 py-2.5 text-sm text-gray-900 dark:text-white focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-white/70">
                {t('admin.customSets.timeLimitMinutes')}
              </label>
              <input
                type="number"
                min={0}
                max={600}
                value={timeLimitMinutes}
                onChange={(e) => setTimeLimitMinutes(Number(e.target.value))}
                className="mt-1 block w-full rounded-lg border border-gray-300 dark:border-white/15 bg-white dark:bg-white/5 px-3 py-2.5 text-sm text-gray-900 dark:text-white focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-white/70">
                {t('admin.customSets.passingScore')}
              </label>
              <input
                type="number"
                min={1}
                max={100}
                value={passingScore}
                onChange={(e) => setPassingScore(Number(e.target.value))}
                className="mt-1 block w-full rounded-lg border border-gray-300 dark:border-white/15 bg-white dark:bg-white/5 px-3 py-2.5 text-sm text-gray-900 dark:text-white focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsActive((v) => !v)}
                className={clsx(
                  'relative inline-flex h-5 w-9 items-center rounded-full transition-colors',
                  isActive ? 'bg-amber-500' : 'bg-gray-300 dark:bg-white/20',
                )}
              >
                <span
                  className={clsx(
                    'inline-block h-4 w-4 rounded-full bg-white shadow transition-transform',
                    isActive ? 'translate-x-4.5' : 'translate-x-0.5',
                  )}
                />
              </button>
              <span className="text-sm text-gray-700 dark:text-white/70">{t('admin.customSets.isActive')}</span>
            </div>
          </div>

          <div className="mt-5 flex justify-end">
            <Button
              label={metaSaving ? t('common.saving') : t('admin.customSets.saveMetadata')}
              disabled={metaSaving || !name.trim()}
              onClick={handleMetaSave}
            />
          </div>
        </div>

        {/* Questions card */}
        <div className="rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 p-6">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">
              {t('admin.customSets.questionsSection')}
              <span className="ml-2 text-sm font-normal text-gray-400 dark:text-white/35">
                ({questions.length})
              </span>
            </h2>
            <div className="flex flex-wrap gap-2">
              <Button
                label={t('admin.customSets.addExisting')}
                variant="secondary"
                onClick={() => setShowAddModal(true)}
                disabled={!resolvedSetId()}
              />
              <Button
                label={t('admin.customSets.createNew')}
                onClick={() => setShowCreateModal(true)}
                disabled={!resolvedSetId()}
              />
            </div>
          </div>

          {!resolvedSetId() && (
            <p className="text-sm text-amber-600 dark:text-amber-400">
              {t('admin.customSets.saveFirstHint')}
            </p>
          )}

          {questions.length === 0 && resolvedSetId() ? (
            <p className="text-sm text-gray-400 dark:text-white/30">{t('admin.customSets.noQuestions')}</p>
          ) : (
            <div className="space-y-2">
              {questions.map((q, idx) => (
                <div
                  key={q.id}
                  className="flex items-start gap-3 rounded-lg border border-gray-100 dark:border-white/8 bg-gray-50 dark:bg-white/4 px-4 py-3"
                >
                  <span className="mt-0.5 shrink-0 text-xs font-mono text-gray-400 dark:text-white/30 w-5">
                    {idx + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-gray-800 dark:text-white/90 line-clamp-2">{q.text}</p>
                    <span className="mt-1 inline-block rounded bg-gray-200 dark:bg-white/10 px-1.5 py-0.5 text-xs text-gray-500 dark:text-white/40">
                      {q.category}
                    </span>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      onClick={() => handleMove(idx, -1)}
                      disabled={idx === 0}
                      className="rounded p-1 text-gray-400 hover:text-gray-600 dark:text-white/30 dark:hover:text-white/60 disabled:opacity-25"
                      title={t('admin.customSets.moveUp')}
                    >
                      <ChevronLeftIcon className="h-3.5 w-3.5 -rotate-90" />
                    </button>
                    <button
                      onClick={() => handleMove(idx, 1)}
                      disabled={idx === questions.length - 1}
                      className="rounded p-1 text-gray-400 hover:text-gray-600 dark:text-white/30 dark:hover:text-white/60 disabled:opacity-25"
                      title={t('admin.customSets.moveDown')}
                    >
                      <ChevronRightIcon className="h-3.5 w-3.5 rotate-90" />
                    </button>
                    <button
                      onClick={() => handleRemove(q.id)}
                      disabled={removingId === q.id}
                      className="rounded p-1 text-rose-400 hover:text-rose-600 dark:hover:text-rose-300 disabled:opacity-40"
                      title={t('admin.customSets.removeQuestion')}
                    >
                      <XIcon className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Existing Question Modal */}
      <Modal
        isOpen={showAddModal}
        title={t('admin.customSets.addExisting')}
        onClose={() => { setShowAddModal(false); setBankSearch(''); }}
        wide
      >
        <div className="mb-3">
          <input
            type="text"
            value={bankSearch}
            onChange={(e) => setBankSearch(e.target.value)}
            placeholder={t('admin.customSets.searchQuestions')}
            className="w-full rounded-lg border border-gray-300 dark:border-white/15 bg-white dark:bg-white/5 px-3 py-2 text-sm text-gray-900 dark:text-white focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            autoFocus
          />
        </div>
        {bankLoading ? (
          <div className="flex h-32 items-center justify-center">
            <Spinner />
          </div>
        ) : (
          <div className="max-h-80 overflow-y-auto space-y-1">
            {filteredBank.length === 0 ? (
              <p className="py-8 text-center text-sm text-gray-400">{t('common.noData')}</p>
            ) : (
              filteredBank.map((q) => {
                const inSet = alreadyInSet.has(q.id);
                return (
                  <div
                    key={q.id}
                    className={clsx(
                      'flex items-start gap-3 rounded-lg px-3 py-2.5',
                      inSet ? 'opacity-40' : 'hover:bg-gray-50 dark:hover:bg-white/5',
                    )}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-gray-800 dark:text-white/90 line-clamp-2">{q.text}</p>
                      <span className="text-xs text-gray-400 dark:text-white/35">{q.category}</span>
                    </div>
                    <button
                      onClick={() => !inSet && handleAddExisting(q.id)}
                      disabled={inSet || addingId === q.id}
                      className={clsx(
                        'shrink-0 rounded px-3 py-1 text-xs font-medium transition-colors',
                        inSet
                          ? 'cursor-default text-gray-400'
                          : 'bg-amber-500 text-white hover:bg-amber-600 disabled:opacity-50',
                      )}
                    >
                      {inSet
                        ? t('admin.customSets.alreadyInSet')
                        : addingId === q.id
                        ? '...'
                        : t('admin.customSets.addToSet')}
                    </button>
                  </div>
                );
              })
            )}
          </div>
        )}
        <div className="mt-4 flex justify-end">
          <Button label={t('common.cancel')} variant="secondary" onClick={() => { setShowAddModal(false); setBankSearch(''); }} />
        </div>
      </Modal>

      {/* Create New Question Modal */}
      <Modal
        isOpen={showCreateModal}
        title={t('admin.customSets.newQuestion.title')}
        onClose={() => { setShowCreateModal(false); setCreateError(''); }}
        wide
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-white/70">
              {t('admin.customSets.newQuestion.questionText')} <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              value={newQText}
              onChange={(e) => setNewQText(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-gray-300 dark:border-white/15 bg-white dark:bg-white/5 px-3 py-2 text-sm text-gray-900 dark:text-white focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-white/70">
              {t('admin.customSets.newQuestion.explanation')}
            </label>
            <textarea
              rows={2}
              value={newQExplanation}
              onChange={(e) => setNewQExplanation(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-gray-300 dark:border-white/15 bg-white dark:bg-white/5 px-3 py-2 text-sm text-gray-900 dark:text-white focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-white/70 mb-2">
              {t('admin.customSets.newQuestion.choices')}
            </label>
            <div className="space-y-2">
              {newQChoices.map((c, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="correct"
                    checked={c.is_correct}
                    onChange={() => setCorrectChoice(idx)}
                    className="h-4 w-4 shrink-0 accent-amber-500"
                    title={t('admin.customSets.newQuestion.correctAnswer')}
                  />
                  <input
                    type="text"
                    value={c.text}
                    onChange={(e) =>
                      setNewQChoices((prev) =>
                        prev.map((x, i) => (i === idx ? { ...x, text: e.target.value } : x)),
                      )
                    }
                    placeholder={t('admin.customSets.newQuestion.choicePlaceholder', { n: idx + 1 })}
                    className="flex-1 rounded-lg border border-gray-300 dark:border-white/15 bg-white dark:bg-white/5 px-3 py-2 text-sm text-gray-900 dark:text-white focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                  {newQChoices.length > 2 && (
                    <button
                      onClick={() =>
                        setNewQChoices((prev) => {
                          const next = prev.filter((_, i) => i !== idx);
                          if (!next.some((c) => c.is_correct)) next[0].is_correct = true;
                          return next;
                        })
                      }
                      className="text-rose-400 hover:text-rose-600"
                    >
                      <XIcon className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            {newQChoices.length < 6 && (
              <button
                onClick={() => setNewQChoices((prev) => [...prev, { text: '', is_correct: false }])}
                className="mt-2 text-sm font-medium text-amber-600 hover:text-amber-700 dark:text-amber-400"
              >
                + {t('admin.customSets.newQuestion.addChoice')}
              </button>
            )}
          </div>
          {createError && (
            <p className="text-sm text-rose-600 dark:text-rose-400">{createError}</p>
          )}
        </div>
        <div className="mt-5 flex justify-end gap-3">
          <Button
            label={t('common.cancel')}
            variant="secondary"
            onClick={() => { setShowCreateModal(false); setCreateError(''); }}
          />
          <Button
            label={createSaving ? t('common.saving') : t('admin.customSets.newQuestion.save')}
            disabled={createSaving}
            onClick={handleCreateQuestion}
          />
        </div>
      </Modal>
    </PageShell>
  );
};

export default CustomSetEditor;
