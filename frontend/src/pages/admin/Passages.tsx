import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { PageShell } from '@/components/layout/PageShell';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Spinner } from '@/components/ui/Spinner';
import { Badge } from '@/components/ui/Badge';
import { getPassages, createPassage, updatePassage, deletePassage } from '@/services/passageService';
import type { Passage, JLPTLevel } from '@/types/exam';

type PassageRow = Passage & { questions_count: number };

const LEVELS: JLPTLevel[] = ['N1', 'N2', 'N3', 'N4', 'N5'];

const emptyForm = { title: '', content: '', level: 'N5' as JLPTLevel };

const Passages = () => {
  const { t } = useTranslation();
  const [passages, setPassages]   = useState<PassageRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterLevel, setFilterLevel] = useState<JLPTLevel | ''>('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<PassageRow | null>(null);
  const [form, setForm]           = useState(emptyForm);
  const [saving, setSaving]       = useState(false);
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

  const openCreate = () => {
    setEditTarget(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (p: PassageRow) => {
    setEditTarget(p);
    setForm({ title: p.title, content: p.content, level: p.level });
    setModalOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editTarget) {
        await updatePassage(editTarget.id, form);
      } else {
        await createPassage(form);
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
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{t('admin.passages.title')}</h1>
          <p className="mt-1 text-sm text-slate-500">{t('admin.passages.subtitle')}</p>
        </div>
        <Button label={t('admin.passages.newButton')} onClick={openCreate} />
      </div>

      {/* Level filter */}
      <div className="mb-4 flex flex-wrap gap-2">
        <button
          onClick={() => setFilterLevel('')}
          className={`rounded-full border px-4 py-1 text-sm font-medium transition-colors ${filterLevel === '' ? 'border-indigo-500 bg-indigo-500 text-white' : 'border-slate-200 text-slate-600 hover:border-slate-400'}`}
        >
          {t('admin.passages.allLevels')}
        </button>
        {LEVELS.map((l) => (
          <button
            key={l}
            onClick={() => setFilterLevel(l)}
            className={`rounded-full border px-4 py-1 text-sm font-medium transition-colors ${filterLevel === l ? 'border-indigo-500 bg-indigo-500 text-white' : 'border-slate-200 text-slate-600 hover:border-slate-400'}`}
          >
            {l}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : passages.length === 0 ? (
        <p className="py-16 text-center text-sm text-slate-400">{t('common.noData')}</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-[640px] w-full text-sm">
            <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3 text-left">{t('admin.passages.colTitle')}</th>
                <th className="px-4 py-3 text-left">{t('admin.passages.colLevel')}</th>
                <th className="px-4 py-3 text-left">{t('admin.passages.colQuestions')}</th>
                <th className="px-4 py-3 text-left">{t('admin.passages.colActions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {passages.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="max-w-xs truncate px-4 py-3 font-medium text-slate-900">{p.title}</td>
                  <td className="px-4 py-3"><Badge label={p.level} variant="default" /></td>
                  <td className="px-4 py-3 text-slate-600">{p.questions_count}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(p)} className="text-indigo-600 hover:underline">{t('common.edit')}</button>
                      <button onClick={() => setDeleteTarget(p)} className="text-red-500 hover:underline">{t('common.delete')}</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
            <label className="mb-1 block text-sm font-medium text-slate-700">{t('admin.passages.fieldTitle')}</label>
            <input
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">{t('admin.passages.fieldLevel')}</label>
            <select
              value={form.level}
              onChange={(e) => setForm((f) => ({ ...f, level: e.target.value as JLPTLevel }))}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
            >
              {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">{t('admin.passages.fieldContent')}</label>
            <textarea
              value={form.content}
              onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
              rows={8}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
            />
          </div>
          <div className="flex justify-end gap-3">
            <Button label={t('common.cancel')} variant="secondary" onClick={() => setModalOpen(false)} />
            <Button label={saving ? t('common.saving') : t('common.save')} disabled={saving || !form.title || !form.content} onClick={handleSave} />
          </div>
        </div>
      </Modal>

      {/* Delete confirm modal */}
      <Modal isOpen={!!deleteTarget} title={t('common.confirmDelete')} onClose={() => setDeleteTarget(null)}>
        <p className="mb-6 text-sm text-slate-600">{deleteTarget?.title}</p>
        <div className="flex justify-end gap-3">
          <Button label={t('common.cancel')} variant="secondary" onClick={() => setDeleteTarget(null)} />
          <Button label={t('common.delete')} variant="danger" onClick={handleDelete} />
        </div>
      </Modal>
    </PageShell>
  );
};

export default Passages;
