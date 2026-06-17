import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { clsx } from 'clsx';
import { PageShell } from '@/components/layout/PageShell';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { TableRowSkeleton } from '@/components/ui/Shimmer';
import { Furigana } from '@/components/shared/Furigana';
import { getAdminFlashcards, createFlashcard, updateFlashcard, deleteFlashcard } from '@/services/flashcardService';
import type { Flashcard, FlashcardType, FlashcardLevel } from '@/types/flashcard';

const TYPES: FlashcardType[]  = ['kanji', 'vocab', 'grammar'];
const LEVELS: FlashcardLevel[] = ['N1', 'N2', 'N3', 'N4', 'N5'];

const emptyForm = {
  type: 'kanji' as FlashcardType,
  level: 'N5' as FlashcardLevel,
  front: '',
  reading: '',
  meaning: '',
  example_sentence: '',
  example_translation: '',
};

const Flashcards = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [cards, setCards]           = useState<Flashcard[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading]   = useState(true);
  const [filterType, setFilterType] = useState<FlashcardType | ''>('');
  const [filterLevel, setFilterLevel] = useState<FlashcardLevel | ''>('');

  const [modalOpen, setModalOpen]   = useState(false);
  const [editTarget, setEditTarget] = useState<Flashcard | null>(null);
  const [form, setForm]             = useState(emptyForm);
  const [saving, setSaving]         = useState(false);
  const [saveError, setSaveError]   = useState<string | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<Flashcard | null>(null);
  const [isDeleting, setIsDeleting]     = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await getAdminFlashcards(filterType || undefined, filterLevel || undefined);
      setCards(res.data);
      setTotalCount(res.count);
    } finally {
      setIsLoading(false);
    }
  }, [filterType, filterLevel]);

  useEffect(() => { void load(); }, [load]);

  const openCreate = () => {
    setEditTarget(null);
    setForm(emptyForm);
    setSaveError(null);
    setModalOpen(true);
  };

  const openEdit = (c: Flashcard) => {
    setEditTarget(c);
    setForm({
      type:                c.type,
      level:               c.level,
      front:               c.front,
      reading:             c.reading ?? '',
      meaning:             c.meaning,
      example_sentence:    c.example_sentence ?? '',
      example_translation: c.example_translation ?? '',
    });
    setSaveError(null);
    setModalOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveError(null);
    const payload = {
      ...form,
      reading:             form.reading || null,
      example_sentence:    form.example_sentence || null,
      example_translation: form.example_translation || null,
    };
    try {
      if (editTarget) {
        await updateFlashcard(editTarget.id, payload);
      } else {
        await createFlashcard(payload);
      }
      setModalOpen(false);
      void load();
    } catch {
      setSaveError(t('common.error'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteFlashcard(deleteTarget.id);
      setDeleteTarget(null);
      void load();
    } finally {
      setIsDeleting(false);
    }
  };

  const typeColor: Record<FlashcardType, string> = {
    kanji:   'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300',
    vocab:   'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300',
    grammar: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300',
  };

  return (
    <PageShell>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('admin.flashcards.title')}</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-white/50">
            {t('admin.flashcards.subtitle', { count: totalCount })}
          </p>
        </div>
        <div className="flex gap-2">
          <Button label={t('admin.flashcards.importButton')} variant="secondary" onClick={() => navigate('/admin/flashcards/import')} />
          <Button label={t('admin.flashcards.newButton')} onClick={openCreate} />
        </div>
      </div>

      {/* Filters */}
      <div className="mb-5 flex flex-wrap gap-2">
        {/* Type filter */}
        <button
          onClick={() => setFilterType('')}
          className={clsx('rounded-full border px-4 py-1 text-sm font-medium transition-colors',
            filterType === ''
              ? 'border-amber-500 bg-amber-500 text-white'
              : 'border-slate-200 text-slate-600 hover:border-amber-400 dark:border-white/15 dark:text-white/55')}
        >
          {t('admin.flashcards.allTypes')}
        </button>
        {TYPES.map((tp) => (
          <button
            key={tp}
            onClick={() => setFilterType(tp)}
            className={clsx('rounded-full border px-4 py-1 text-sm font-medium capitalize transition-colors',
              filterType === tp
                ? 'border-amber-500 bg-amber-500 text-white'
                : 'border-slate-200 text-slate-600 hover:border-amber-400 dark:border-white/15 dark:text-white/55')}
          >
            {t(`study.${tp}.title`)}
          </button>
        ))}

        <span className="mx-1 self-center text-slate-300 dark:text-white/20">|</span>

        {/* Level filter */}
        <button
          onClick={() => setFilterLevel('')}
          className={clsx('rounded-full border px-4 py-1 text-sm font-medium transition-colors',
            filterLevel === ''
              ? 'border-slate-700 bg-slate-700 text-white dark:border-white/60 dark:bg-white/20'
              : 'border-slate-200 text-slate-600 hover:border-slate-400 dark:border-white/15 dark:text-white/55')}
        >
          {t('admin.passages.allLevels')}
        </button>
        {LEVELS.map((l) => (
          <button
            key={l}
            onClick={() => setFilterLevel(l)}
            className={clsx('rounded-full border px-4 py-1 text-sm font-medium transition-colors',
              filterLevel === l
                ? 'border-slate-700 bg-slate-700 text-white dark:border-white/60 dark:bg-white/20'
                : 'border-slate-200 text-slate-600 hover:border-slate-400 dark:border-white/15 dark:text-white/55')}
          >
            {l}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-white/10 dark:bg-white/5">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50 dark:border-white/8 dark:bg-white/5">
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-white/40">{t('admin.flashcards.colType')}</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-white/40">{t('admin.flashcards.colLevel')}</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-white/40">{t('admin.flashcards.colFront')}</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-white/40">{t('admin.flashcards.colReading')}</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-white/40">{t('admin.flashcards.colMeaning')}</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {isLoading
                ? Array.from({ length: 8 }).map((_, i) => <TableRowSkeleton key={i} cols={6} />)
                : cards.length === 0
                ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-10 text-center text-sm text-gray-300 dark:text-white/30">
                        {t('common.noData')}
                      </td>
                    </tr>
                  )
                : cards.map((card) => (
                    <tr key={card.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 dark:border-white/5 dark:hover:bg-white/4">
                      <td className="px-5 py-3">
                        <span className={clsx('inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize', typeColor[card.type])}>
                          {t(`study.${card.type}.title`)}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-xs font-semibold text-slate-500 dark:text-white/50">{card.level}</td>
                      <td className="px-5 py-3 text-lg font-bold text-slate-900 dark:text-white">{card.front}</td>
                      <td className="px-5 py-3 text-slate-500 dark:text-white/50">{card.reading ?? '—'}</td>
                      <td className="max-w-xs truncate px-5 py-3 text-slate-700 dark:text-white/70">{card.meaning}</td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-end gap-3">
                          <button onClick={() => openEdit(card)} className="text-xs font-medium text-amber-500 hover:text-amber-700 dark:text-amber-400">
                            {t('common.edit')}
                          </button>
                          <button onClick={() => setDeleteTarget(card)} className="text-xs font-medium text-red-400 hover:text-red-600">
                            {t('common.delete')}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit modal */}
      <Modal
        isOpen={modalOpen}
        title={editTarget ? t('admin.flashcards.editTitle') : t('admin.flashcards.newTitle')}
        onClose={() => setModalOpen(false)}
        wide
      >
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">

          {/* ── Form ── */}
          <div className="min-w-0 flex-1 space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-white/80">{t('admin.flashcards.fieldType')}</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as FlashcardType }))}
                  className="block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-amber-500 focus:outline-none dark:border-white/15 dark:bg-white/5 dark:text-white"
                >
                  {TYPES.map((tp) => <option key={tp} value={tp}>{t(`study.${tp}.title`)}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-white/80">{t('admin.flashcards.fieldLevel')}</label>
                <select
                  value={form.level}
                  onChange={(e) => setForm((f) => ({ ...f, level: e.target.value as FlashcardLevel }))}
                  className="block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-amber-500 focus:outline-none dark:border-white/15 dark:bg-white/5 dark:text-white"
                >
                  {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-white/80">{t('admin.flashcards.fieldFront')}</label>
                <input
                  value={form.front}
                  onChange={(e) => setForm((f) => ({ ...f, front: e.target.value }))}
                  className="block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-amber-500 focus:outline-none dark:border-white/15 dark:bg-white/5 dark:text-white"
                  placeholder="漢字 / 語彙 / 文法パターン"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-white/80">{t('admin.flashcards.fieldReading')}</label>
                <input
                  value={form.reading}
                  onChange={(e) => setForm((f) => ({ ...f, reading: e.target.value }))}
                  className="block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-amber-500 focus:outline-none dark:border-white/15 dark:bg-white/5 dark:text-white"
                  placeholder="ひらがな（任意）"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-white/80">{t('admin.flashcards.fieldMeaning')}</label>
              <input
                value={form.meaning}
                onChange={(e) => setForm((f) => ({ ...f, meaning: e.target.value }))}
                className="block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-amber-500 focus:outline-none dark:border-white/15 dark:bg-white/5 dark:text-white"
                placeholder="English meaning"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-white/80">{t('admin.flashcards.fieldExample')}</label>
              <input
                value={form.example_sentence}
                onChange={(e) => setForm((f) => ({ ...f, example_sentence: e.target.value }))}
                className="block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-amber-500 focus:outline-none dark:border-white/15 dark:bg-white/5 dark:text-white"
                placeholder="例文（任意）"
              />
              <p className="mt-1.5 flex items-start gap-1.5 text-xs text-slate-400 dark:text-white/40">
                <span className="mt-px shrink-0 rounded bg-amber-100 px-1 py-0.5 font-mono text-[10px] font-semibold text-amber-700 dark:bg-amber-400/15 dark:text-amber-300">
                  {'{漢字|よみ}'}
                </span>
                {t('admin.flashcards.fieldExampleHint')}
              </p>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-white/80">{t('admin.flashcards.fieldExampleTranslation')}</label>
              <input
                value={form.example_translation}
                onChange={(e) => setForm((f) => ({ ...f, example_translation: e.target.value }))}
                className="block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-amber-500 focus:outline-none dark:border-white/15 dark:bg-white/5 dark:text-white"
                placeholder="Example translation (optional)"
              />
            </div>

            {saveError && <p className="text-sm text-red-500">{saveError}</p>}

            <div className="flex justify-end gap-3 pt-1">
              <Button label={t('common.cancel')} variant="secondary" onClick={() => setModalOpen(false)} />
              <Button
                label={saving ? t('common.saving') : t('common.save')}
                disabled={saving || !form.front || !form.meaning}
                onClick={handleSave}
              />
            </div>
          </div>

          {/* ── Live preview ── */}
          <div className="w-full shrink-0 lg:w-64">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-white/40">
              {t('admin.flashcards.previewTitle')}
            </p>

            {form.front || form.meaning ? (
              <div className="flex flex-col gap-3">
                {/* Front card */}
                <div className="rounded-2xl border border-amber-200/70 bg-gradient-to-br from-white to-amber-50 p-4 shadow-sm dark:border-amber-400/20 dark:from-slate-800 dark:to-slate-700">
                  <p className="mb-2 text-center text-[10px] font-semibold uppercase tracking-widest text-amber-500 dark:text-amber-400">
                    {t('admin.flashcards.previewFront')}
                  </p>
                  <p className="text-center text-3xl font-bold text-slate-900 dark:text-white">
                    {form.front || '—'}
                  </p>
                  <div className="mt-2 flex justify-center gap-1.5">
                    <span className={clsx('rounded-full px-2 py-0.5 text-[10px] font-medium capitalize', typeColor[form.type])}>
                      {t(`study.${form.type}.title`)}
                    </span>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500 dark:bg-white/10 dark:text-white/50">
                      {form.level}
                    </span>
                  </div>
                </div>

                {/* Back card */}
                <div className="rounded-2xl border border-slate-200/70 bg-gradient-to-br from-slate-50 to-white p-4 shadow-sm dark:border-white/10 dark:from-slate-700 dark:to-slate-800">
                  <p className="mb-2 text-center text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-white/40">
                    {t('admin.flashcards.previewBack')}
                  </p>
                  {form.reading && (
                    <p className="text-center text-sm font-medium text-amber-600 dark:text-amber-400">{form.reading}</p>
                  )}
                  <p className="text-center text-base font-bold text-slate-900 dark:text-white">
                    {form.meaning || '—'}
                  </p>
                  {form.example_sentence && (
                    <div className="mt-3 rounded-xl bg-slate-100 px-3 py-2 dark:bg-white/8">
                      <p className="text-center text-xs leading-loose text-slate-700 dark:text-white/80">
                        <Furigana text={form.example_sentence} />
                      </p>
                      {form.example_translation && (
                        <p className="mt-1 text-center text-[10px] text-slate-400 dark:text-white/40">
                          {form.example_translation}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <p className="rounded-xl border border-dashed border-slate-200 p-4 text-center text-xs text-slate-400 dark:border-white/10 dark:text-white/30">
                {t('admin.flashcards.previewEmpty')}
              </p>
            )}
          </div>

        </div>
      </Modal>

      {/* Delete confirm modal */}
      <Modal
        isOpen={!!deleteTarget}
        title={t('common.confirmDelete')}
        onClose={() => setDeleteTarget(null)}
      >
        <p className="mb-6 text-sm text-slate-600 dark:text-white/70">
          {deleteTarget?.front} — {deleteTarget?.meaning}
        </p>
        <div className="flex justify-end gap-3">
          <Button label={t('common.cancel')} variant="secondary" onClick={() => setDeleteTarget(null)} disabled={isDeleting} />
          <Button label={isDeleting ? t('common.saving') : t('common.delete')} variant="danger" onClick={handleDelete} disabled={isDeleting} />
        </div>
      </Modal>
    </PageShell>
  );
};

export default Flashcards;
