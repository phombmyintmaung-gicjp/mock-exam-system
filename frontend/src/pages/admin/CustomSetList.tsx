import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { clsx } from 'clsx';
import { PageShell } from '@/components/layout/PageShell';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { Modal } from '@/components/ui/Modal';
import { ClipboardCheckIcon, BarChartIcon } from '@/components/ui/Icons';
import { listCustomSets, deleteCustomSet } from '@/services/customSetService';
import type { CustomSetSummary } from '@/types/customSet';
import { APP_BASE_PATH } from '@/constants';

const CustomSetList = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [sets, setSets] = useState<CustomSetSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CustomSetSummary | null>(null);
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  useEffect(() => {
    listCustomSets()
      .then(setSets)
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const handleCopyLink = (slug: string) => {
    const url = `${window.location.origin}${APP_BASE_PATH}/exam/custom/${slug}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(() => {
        setCopiedSlug(slug);
        setTimeout(() => setCopiedSlug(null), 2000);
      });
    } else {
      // Fallback for non-HTTPS / unsupported browsers
      const el = document.createElement('textarea');
      el.value = url;
      el.style.position = 'fixed';
      el.style.opacity = '0';
      document.body.appendChild(el);
      el.focus();
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopiedSlug(slug);
      setTimeout(() => setCopiedSlug(null), 2000);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeletingId(deleteTarget.id);
    try {
      await deleteCustomSet(deleteTarget.id);
      setSets((prev) => prev.filter((s) => s.id !== deleteTarget.id));
    } finally {
      setDeletingId(null);
      setDeleteTarget(null);
    }
  };

  const formatTime = (seconds: number) => {
    if (seconds === 0) return t('admin.customSets.noTimeLimit');
    const m = Math.round(seconds / 60);
    return `${m} ${t('admin.customSets.minutes')}`;
  };

  return (
    <PageShell>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('admin.customSets.title')}</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-white/50">{t('admin.customSets.subtitle')}</p>
        </div>
        <div className="flex gap-2">
          <Button label={t('admin.customSets.import.importButton')} variant="secondary" onClick={() => navigate('/admin/custom-sets/import')} />
          <Button label={t('admin.customSets.createSet')} onClick={() => navigate('/admin/custom-sets/create')} />
        </div>
      </div>

      {isLoading ? (
        <div className="flex min-h-[30vh] items-center justify-center">
          <Spinner size="lg" />
        </div>
      ) : sets.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 dark:border-white/15 py-16 text-center">
          <ClipboardCheckIcon className="mb-3 h-10 w-10 text-gray-300 dark:text-white/20" />
          <p className="text-sm font-medium text-gray-500 dark:text-white/50">{t('admin.customSets.emptyState')}</p>
          <button
            onClick={() => navigate('/admin/custom-sets/create')}
            className="mt-4 text-sm font-medium text-amber-600 hover:underline dark:text-amber-400"
          >
            {t('admin.customSets.createFirst')}
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5">
          <table className="min-w-[700px] w-full text-sm">
            <thead className="bg-gray-50 dark:bg-white/5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-white/40">
              <tr>
                <th className="px-5 py-3">{t('admin.customSets.colName')}</th>
                <th className="px-5 py-3">{t('admin.customSets.colCode')}</th>
                <th className="px-5 py-3 text-center whitespace-nowrap">{t('admin.customSets.colQuestions')}</th>
                <th className="px-5 py-3 text-center">{t('admin.customSets.colPassing')}</th>
                <th className="px-5 py-3 whitespace-nowrap">{t('admin.customSets.colTime')}</th>
                <th className="px-5 py-3 text-center">{t('admin.customSets.colStatus')}</th>
                <th className="px-5 py-3 text-right">{t('admin.customSets.colActions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/8">
              {sets.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50 dark:hover:bg-white/4 transition-colors">
                  <td className="px-5 py-4 font-medium text-gray-900 dark:text-white">
                    {s.name}
                    {s.description && (
                      <p className="mt-0.5 text-xs font-normal text-gray-400 dark:text-white/35 line-clamp-1">
                        {s.description}
                      </p>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <code className="rounded bg-gray-100 dark:bg-white/10 px-2 py-0.5 text-xs font-mono text-gray-700 dark:text-white/70">
                        {s.slug}
                      </code>
                      <button
                        onClick={() => handleCopyLink(s.slug)}
                        className="text-xs text-amber-600 hover:text-amber-700 dark:text-amber-400 font-medium whitespace-nowrap"
                      >
                        {copiedSlug === s.slug ? t('admin.customSets.linkCopied') : t('admin.customSets.copyLink')}
                      </button>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-center text-gray-600 dark:text-white/60">{s.questionCount}</td>
                  <td className="px-5 py-4 text-center text-gray-600 dark:text-white/60">{s.passingScore}%</td>
                  <td className="px-5 py-4 text-gray-600 dark:text-white/60 whitespace-nowrap">
                    {formatTime(s.timeLimitSeconds)}
                  </td>
                  <td className="px-5 py-4 text-center">
                    <span
                      className={clsx(
                        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap',
                        s.isActive
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300'
                          : 'bg-gray-100 text-gray-500 dark:bg-white/10 dark:text-white/40',
                      )}
                    >
                      {s.isActive ? t('admin.customSets.statusActive') : t('admin.customSets.statusInactive')}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-3">
                      <Link
                        to={`/admin/custom-sets/${s.id}/results`}
                        className="flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-gray-700 dark:text-white/40 dark:hover:text-white/70 whitespace-nowrap"
                      >
                        <BarChartIcon className="h-3.5 w-3.5" />
                        {t('admin.customSets.viewResults')}
                      </Link>
                      <Link
                        to={`/admin/custom-sets/${s.id}/edit`}
                        className="text-xs font-medium text-amber-600 hover:text-amber-700 dark:text-amber-400 whitespace-nowrap"
                      >
                        {t('common.edit')}
                      </Link>
                      <button
                        onClick={() => setDeleteTarget(s)}
                        disabled={deletingId === s.id}
                        className="text-xs font-medium text-rose-500 hover:text-rose-600 dark:text-rose-400 disabled:opacity-40 whitespace-nowrap"
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
      )}

      <Modal
        isOpen={!!deleteTarget}
        title={t('admin.customSets.deleteConfirmTitle')}
        onClose={() => setDeleteTarget(null)}
      >
        <p className="mb-6 text-sm text-gray-600 dark:text-white/70">
          {t('admin.customSets.deleteConfirmMessage', { name: deleteTarget?.name ?? '' })}
        </p>
        <div className="flex justify-end gap-3">
          <Button label={t('common.cancel')} variant="secondary" onClick={() => setDeleteTarget(null)} />
          <Button
            label={deletingId ? t('common.saving') : t('common.delete')}
            variant="danger"
            disabled={!!deletingId}
            onClick={handleDeleteConfirm}
          />
        </div>
      </Modal>
    </PageShell>
  );
};

export default CustomSetList;
