import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { clsx } from 'clsx';
import { PageShell } from '@/components/layout/PageShell';
import { Badge } from '@/components/ui/Badge';
import { Pagination } from '@/components/ui/Pagination';
import { TableRowSkeleton } from '@/components/ui/Shimmer';
import { TriangleAlertIcon } from '@/components/ui/Icons';
import { getAdminAllResults } from '@/services/resultService';
import type { HistoryItem, PassFailStatus } from '@/types/result';

type StatusFilter = 'all' | PassFailStatus;

const AdminResults = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const PAGE_SIZE = 20;

  const load = useCallback((p: number, q: string) => {
    setIsLoading(true);
    getAdminAllResults(p, q)
      .then((res) => {
        setItems(res.data);
        setTotal(res.count);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => { load(page, search); }, [page, search, load]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  };

  const filtered = statusFilter === 'all'
    ? items
    : items.filter((r) => r.status === statusFilter);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const fmt = (iso: string) =>
    `${new Date(iso).toLocaleDateString()} ${new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}`;

  return (
    <PageShell>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t('admin.results.title')}</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-white/50">{t('admin.results.subtitle')}</p>
        </div>
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <form onSubmit={handleSearch} className="flex flex-1 gap-2">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder={t('admin.results.searchPlaceholder')}
            className="glass-input flex-1 rounded-xl px-4 py-2 text-sm"
          />
        </form>
        <div className="flex gap-2">
          {(['all', 'pass', 'fail'] as StatusFilter[]).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={clsx(
                'rounded-xl px-4 py-2 text-sm font-medium transition-colors',
                statusFilter === s
                  ? s === 'pass'
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300'
                    : s === 'fail'
                    ? 'bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-300'
                    : 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300'
                  : 'bg-gray-100 text-gray-500 dark:bg-white/8 dark:text-white/45 hover:bg-gray-200 dark:hover:bg-white/12',
              )}
            >
              {s === 'all' ? t('admin.customSets.filterAll') : s === 'pass' ? t('result.pass') : t('result.fail')}
            </button>
          ))}
        </div>
      </div>

      <div className="glass-card overflow-hidden rounded-2xl shadow-xl shadow-black/8 dark:shadow-black/20">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-slate-100 dark:border-white/8 bg-black/5 dark:bg-white/5">
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-white/40">{t('admin.results.columnUser')}</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-white/40">{t('admin.results.columnCategory')}</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-white/40">{t('admin.results.columnScore')}</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-white/40">{t('admin.results.columnStatus')}</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-white/40">{t('admin.results.columnDate')}</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody>
              {isLoading
                ? Array.from({ length: 8 }).map((_, i) => <TableRowSkeleton key={i} cols={6} />)
                : filtered.length === 0
                ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-10 text-center text-sm text-slate-300 dark:text-white/30">
                        {t('admin.results.noResults')}
                      </td>
                    </tr>
                  )
                : filtered.map((item) => (
                    <tr
                      key={item.id}
                      onClick={() => navigate(`/admin/results/${item.id}`)}
                      className="border-b border-slate-100 dark:border-white/5 last:border-0 cursor-pointer transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                    >
                      <td className="px-6 py-4 font-medium text-slate-700 dark:text-white/80">{item.userName || '—'}</td>
                      <td className="px-6 py-4 text-slate-600 dark:text-white/70">{item.category || '—'}</td>
                      <td className="px-6 py-4 font-medium text-slate-800 dark:text-white/90">
                        {item.totalQuestions > 0
                          ? `${item.score} / ${item.totalQuestions} (${Math.round((item.score / item.totalQuestions) * 100)}%)`
                          : '—'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <Badge
                            label={t(item.status === 'pass' ? 'result.pass' : 'result.fail')}
                            variant={item.status}
                          />
                          {item.submittedBy === 'violation' && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2 py-0.5 text-xs font-semibold text-orange-700 dark:bg-orange-500/20 dark:text-orange-300">
                              <TriangleAlertIcon className="h-3 w-3 shrink-0" />
                              {t('result.submittedByViolation')}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-400 dark:text-white/45">
                        {item.completedAt ? fmt(item.completedAt) : '—'}
                      </td>
                      <td className="px-6 py-4 text-right text-xs font-medium text-amber-500 dark:text-amber-400">
                        {t('admin.results.viewDetail')}
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
        {!isLoading && totalPages > 1 && (
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        )}
      </div>
    </PageShell>
  );
};

export default AdminResults;
