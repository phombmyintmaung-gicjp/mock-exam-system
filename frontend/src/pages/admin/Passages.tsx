import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { clsx } from 'clsx';
import { PageShell } from '@/components/layout/PageShell';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Spinner } from '@/components/ui/Spinner';
import { Badge } from '@/components/ui/Badge';
import { getPassages, createPassage, updatePassage, deletePassage } from '@/services/passageService';
import { getCategories } from '@/services/categoryService';
import type { Passage, JLPTLevel } from '@/types/exam';
import type { Category } from '@/types/category';

type PassageRow = Passage & { questions_count: number };

const LEVELS: JLPTLevel[] = ['N1', 'N2', 'N3', 'N4', 'N5'];

const LEVEL_COLORS: Record<JLPTLevel, string> = {
  N1: 'from-rose-500 to-rose-600',
  N2: 'from-orange-500 to-amber-500',
  N3: 'from-yellow-500 to-lime-500',
  N4: 'from-emerald-500 to-teal-500',
  N5: 'from-blue-500 to-cyan-500',
};

const emptyForm = { title: '', content: '', level: 'N5' as JLPTLevel, category_id: '' as string };

const Passages = () => {
  const { t } = useTranslation();
  const [passages, setPassages]         = useState<PassageRow[]>([]);
  const [categories, setCategories]     = useState<Category[]>([]);
  const [isLoading, setIsLoading]       = useState(true);
  const [filterLevel, setFilterLevel]   = useState<JLPTLevel | ''>('');
  const [modalOpen, setModalOpen]       = useState(false);
  const [editTarget, setEditTarget]     = useState<PassageRow | null>(null);
  const [form, setForm]                 = useState(emptyForm);
  const [saving, setSaving]             = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<PassageRow | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await getPassages(filterLevel || undefined);
      setPassages(res.data);
    } finally {
      setIsLoading(false);
    }
  }, [filterLevel]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    getCategories().then(setCategories).catch(() => {});
  }, []);

  const openCreate = () => {
    setEditTarget(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (p: PassageRow) => {
    setEditTarget(p);
    setForm({ title: p.title, content: p.content, level: p.level, category_id: p.category_id != null ? String(p.category_id) : '' });
    setModalOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    const payload = { ...form, category_id: form.category_id ? Number(form.category_id) : null };
    try {
      if (editTarget) {
        await updatePassage(editTarget.id, payload);
      } else {
        await createPassage(payload);
      }
      setModalOpen(false);
      load();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deletePassage(deleteTarget.id);
    setDeleteTarget(null);
    load();
  };

  return (
    <PageShell>
      {/* Page header */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            {t('admin.passages.title')}
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-white/50">
            {t('admin.passages.subtitle')}
          </p>
        </div>
        <Button label={t('admin.passages.newButton')} onClick={openCreate} />
      </div>

      {/* Level filter chips */}
      <div className="mb-5 flex flex-wrap gap-2">
        <button
          onClick={() => setFilterLevel('')}
          className={clsx(
            'rounded-full border px-4 py-1 text-sm font-medium transition-colors',
            filterLevel === ''
              ? 'border-amber-500 bg-amber-500 text-white'
              : 'border-slate-200 text-slate-600 hover:border-amber-400 hover:text-amber-600 dark:border-white/15 dark:text-white/55 dark:hover:border-white/30 dark:hover:text-white',
          )}
        >
          {t('admin.passages.allLevels')}
        </button>
        {LEVELS.map((l) => (
          <button
            key={l}
            onClick={() => setFilterLevel(l)}
            className={clsx(
              'rounded-full border px-4 py-1 text-sm font-medium transition-colors',
              filterLevel === l
                ? 'border-amber-500 bg-amber-500 text-white'
                : 'border-slate-200 text-slate-600 hover:border-amber-400 hover:text-amber-600 dark:border-white/15 dark:text-white/55 dark:hover:border-white/30 dark:hover:text-white',
            )}
          >
            {l}
          </button>
        ))}
      </div>

      {/* Table / empty / loading */}
      {isLoading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : passages.length === 0 ? (
        <div className="glass-card flex flex-col items-center justify-center rounded-2xl py-20 text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20">
            <svg className="h-6 w-6 text-amber-500 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-sm text-slate-400 dark:text-white/40">{t('common.noData')}</p>
        </div>
      ) : (
        <div className="glass-card overflow-hidden rounded-2xl">
          <div className="overflow-x-auto">
            <table className="min-w-[640px] w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 dark:border-white/8">
                  <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-white/40">
                    {t('admin.passages.colTitle')}
                  </th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-white/40">
                    {t('admin.passages.colLevel')}
                  </th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-white/40 whitespace-nowrap">
                    {t('admin.passages.colCategory')}
                  </th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-white/40 whitespace-nowrap">
                    {t('admin.passages.colQuestions')}
                  </th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-white/40">
                    {t('admin.passages.colActions')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-white/5">
                {passages.map((p) => (
                  <tr key={p.id} className="group transition-colors hover:bg-slate-50/60 dark:hover:bg-white/4">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className={clsx('flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br text-xs font-bold text-white shadow-sm', LEVEL_COLORS[p.level])}>
                          {p.level}
                        </div>
                        <span className="max-w-xs truncate font-medium text-slate-900 dark:text-white">
                          {p.title}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge label={p.level} variant="neutral" />
                    </td>
                    <td className="px-5 py-3.5 text-slate-600 dark:text-white/60">
                      {p.category?.name ?? <span className="text-slate-300 dark:text-white/20">—</span>}
                    </td>
                    <td className="px-5 py-3.5 text-slate-600 dark:text-white/60">
                      {p.questions_count}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => openEdit(p)}
                          className="text-sm font-medium text-amber-600 hover:text-amber-500 dark:text-amber-400 dark:hover:text-amber-300 whitespace-nowrap"
                        >
                          {t('common.edit')}
                        </button>
                        <button
                          onClick={() => setDeleteTarget(p)}
                          className="text-sm font-medium text-rose-500 hover:text-rose-400 dark:text-rose-400 dark:hover:text-rose-300 whitespace-nowrap"
                        >
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
      )}

      {/* Create / Edit modal */}
      <Modal
        isOpen={modalOpen}
        title={editTarget ? t('admin.passages.editTitle') : t('admin.passages.newTitle')}
        onClose={() => setModalOpen(false)}
      >
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-white/80">
              {t('admin.passages.fieldTitle')}
            </label>
            <input
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              className="glass-input w-full rounded-xl px-4 py-2.5 text-sm transition-all"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-white/80">
              {t('admin.passages.fieldLevel')}
            </label>
            <select
              value={form.level}
              onChange={(e) => setForm((f) => ({ ...f, level: e.target.value as JLPTLevel }))}
              className="glass-input w-full rounded-xl px-4 py-2.5 text-sm transition-all"
            >
              {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-white/80">
              {t('admin.passages.fieldCategory')}
            </label>
            <select
              value={form.category_id}
              onChange={(e) => setForm((f) => ({ ...f, category_id: e.target.value }))}
              className="glass-input w-full rounded-xl px-4 py-2.5 text-sm transition-all"
            >
              <option value="">{t('admin.passages.noCategory')}</option>
              {categories.map((c) => <option key={c.id} value={String(c.id)}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-white/80">
              {t('admin.passages.fieldContent')}
            </label>
            <textarea
              value={form.content}
              onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
              rows={8}
              className="glass-input w-full rounded-xl px-4 py-2.5 text-sm transition-all"
            />
          </div>
          <div className="flex justify-end gap-3 pt-1">
            <Button label={t('common.cancel')} variant="secondary" onClick={() => setModalOpen(false)} />
            <Button
              label={saving ? t('common.saving') : t('common.save')}
              disabled={saving || !form.title || !form.content}
              onClick={handleSave}
            />
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
          {deleteTarget?.title}
        </p>
        <div className="flex justify-end gap-3">
          <Button label={t('common.cancel')} variant="secondary" onClick={() => setDeleteTarget(null)} />
          <Button label={t('common.delete')} variant="danger" onClick={handleDelete} />
        </div>
      </Modal>
    </PageShell>
  );
};

export default Passages;
