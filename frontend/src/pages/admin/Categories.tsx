import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { PageShell } from '@/components/layout/PageShell';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { TableRowSkeleton } from '@/components/ui/Shimmer';
import { getCategories, createCategory, updateCategory, deleteCategory } from '@/services/categoryService';
import type { Category } from '@/types/category';

const Categories = () => {
  const { t } = useTranslation();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Add
  const [newName, setNewName] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  // Inline rename
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState('');
  const [isSavingRename, setIsSavingRename] = useState(false);
  const [renameError, setRenameError] = useState<string | null>(null);
  const renameInputRef = useRef<HTMLInputElement>(null);

  // Delete
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch(() => setError(t('common.error')))
      .finally(() => setIsLoading(false));
  }, [t]);

  useEffect(() => {
    if (editingId !== null) renameInputRef.current?.focus();
  }, [editingId]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = newName.trim();
    if (!name) return;
    setIsAdding(true);
    setAddError(null);
    try {
      const created = await createCategory(name);
      setCategories((prev) => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)));
      setNewName('');
    } catch {
      setAddError(t('admin.categories.addError'));
    } finally {
      setIsAdding(false);
    }
  };

  const startEdit = (cat: Category) => {
    setEditingId(cat.id);
    setEditingName(cat.name);
    setRenameError(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingName('');
    setRenameError(null);
  };

  const handleRename = async (id: number) => {
    const name = editingName.trim();
    if (!name) { cancelEdit(); return; }
    const original = categories.find((c) => c.id === id);
    if (name === original?.name) { cancelEdit(); return; }
    setIsSavingRename(true);
    setRenameError(null);
    try {
      const updated = await updateCategory(id, name);
      setCategories((prev) =>
        prev.map((c) => (c.id === id ? updated : c)).sort((a, b) => a.name.localeCompare(b.name)),
      );
      setEditingId(null);
    } catch {
      setRenameError(t('admin.categories.renameError'));
    } finally {
      setIsSavingRename(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (deleteTargetId === null) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await deleteCategory(deleteTargetId);
      setCategories((prev) => prev.filter((c) => c.id !== deleteTargetId));
      setDeleteTargetId(null);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ??
        t('admin.categories.deleteError');
      setDeleteError(msg);
    } finally {
      setIsDeleting(false);
    }
  };

  const deleteTarget = categories.find((c) => c.id === deleteTargetId);

  return (
    <PageShell>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('admin.categories.title')}</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-white/50">{t('admin.categories.subtitle')}</p>
        </div>
      </div>

      {/* Add form */}
      <form
        onSubmit={handleAdd}
        className="mb-6 flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/5 sm:flex-row sm:items-end"
      >
        <div className="flex-1">
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-white/80">
            {t('admin.categories.nameLabel')}
          </label>
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder={t('admin.categories.namePlaceholder')}
            className="block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 dark:border-white/15 dark:bg-white/5 dark:text-white dark:placeholder-white/30"
          />
          {addError && <p className="mt-1 text-xs text-red-500">{addError}</p>}
        </div>
        <Button
          label={isAdding ? t('common.saving') : t('admin.categories.addButton')}
          type="submit"
          disabled={isAdding || !newName.trim()}
        />
      </form>

      {/* Table */}
      {error ? (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">{error}</p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-white/10 dark:bg-white/5">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[400px] text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 dark:border-white/8 dark:bg-white/5">
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-white/40">
                    {t('admin.categories.columnName')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-white/40">
                    {t('admin.categories.columnQuestions')}
                  </th>
                  <th className="px-6 py-3" />
                </tr>
              </thead>
              <tbody>
                {isLoading
                  ? Array.from({ length: 5 }).map((_, i) => <TableRowSkeleton key={i} cols={3} />)
                  : categories.length === 0
                  ? (
                      <tr>
                        <td colSpan={3} className="px-6 py-8 text-center text-sm text-gray-300 dark:text-white/30">
                          {t('common.noData')}
                        </td>
                      </tr>
                    )
                  : categories.map((cat) => (
                      <tr
                        key={cat.id}
                        className="border-b border-gray-100 last:border-0 transition-colors hover:bg-gray-50 dark:border-white/5 dark:hover:bg-white/5"
                      >
                        <td className="px-6 py-3">
                          {editingId === cat.id ? (
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-2">
                                <input
                                  ref={renameInputRef}
                                  type="text"
                                  value={editingName}
                                  onChange={(e) => setEditingName(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') { e.preventDefault(); void handleRename(cat.id); }
                                    if (e.key === 'Escape') cancelEdit();
                                  }}
                                  disabled={isSavingRename}
                                  className="flex-1 rounded-lg border border-amber-400 px-3 py-1.5 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-amber-500 dark:border-amber-400/60 dark:bg-white/5 dark:text-white"
                                />
                                <button
                                  type="button"
                                  onClick={() => void handleRename(cat.id)}
                                  disabled={isSavingRename}
                                  className="rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-amber-600 disabled:opacity-50"
                                >
                                  {t('admin.categories.renameButton')}
                                </button>
                                <button
                                  type="button"
                                  onClick={cancelEdit}
                                  disabled={isSavingRename}
                                  className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs text-gray-500 hover:bg-gray-50 dark:border-white/15 dark:text-white/50"
                                >
                                  {t('common.cancel')}
                                </button>
                              </div>
                              {renameError && <p className="text-xs text-red-500">{renameError}</p>}
                            </div>
                          ) : (
                            <span className="font-medium text-gray-800 dark:text-white/90">{cat.name}</span>
                          )}
                        </td>
                        <td className="px-6 py-3 text-gray-500 dark:text-white/50">
                          {(cat as unknown as { questions_count?: number }).questions_count ?? '—'}
                        </td>
                        <td className="px-6 py-3">
                          {editingId !== cat.id && (
                            <div className="flex items-center justify-end gap-3">
                              <button
                                onClick={() => startEdit(cat)}
                                className="text-xs font-medium text-amber-500 hover:text-amber-700 dark:text-amber-400/80 dark:hover:text-amber-400"
                              >
                                {t('admin.categories.editButton')}
                              </button>
                              <button
                                onClick={() => setDeleteTargetId(cat.id)}
                                className="text-xs font-medium text-red-400 hover:text-red-600 dark:text-red-400/70 dark:hover:text-red-400"
                              >
                                {t('common.delete')}
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete modal */}
      <Modal
        isOpen={deleteTargetId !== null}
        title={t('admin.categories.deleteTitle')}
        onClose={() => { setDeleteTargetId(null); setDeleteError(null); }}
      >
        <p className="mb-4 text-sm text-gray-600 dark:text-white/70">
          {t('admin.categories.deleteMessage', { name: deleteTarget?.name ?? '' })}
        </p>
        {deleteError && (
          <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
            {deleteError}
          </p>
        )}
        <div className="flex justify-end gap-3">
          <Button
            label={t('common.cancel')}
            variant="secondary"
            onClick={() => { setDeleteTargetId(null); setDeleteError(null); }}
            disabled={isDeleting}
          />
          <Button
            label={isDeleting ? t('common.saving') : t('common.delete')}
            variant="danger"
            onClick={handleDeleteConfirm}
            disabled={isDeleting}
          />
        </div>
      </Modal>
    </PageShell>
  );
};

export default Categories;
