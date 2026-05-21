import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { PageShell } from '@/components/layout/PageShell';
import { Badge } from '@/components/ui/Badge';
import { Pagination } from '@/components/ui/Pagination';
import { TableRowSkeleton } from '@/components/ui/Shimmer';
import { getResultHistory } from '@/services/resultService';
import type { HistoryItem } from '@/types/result';

const PER_PAGE = 15;

const History = () => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    getResultHistory(page)
      .then((res) => {
        if (!cancelled) {
          setHistory(res.data);
          setTotalCount(res.count);
        }
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setIsLoading(false); });
    return () => { cancelled = true; };
  }, [page]);

  const totalPages = Math.max(1, Math.ceil(totalCount / PER_PAGE));

  const modeLabel = (mode: string) => {
    if (mode === 'exam') return t('exam.examMode');
    if (mode === 'study') return t('exam.studyMode');
    return mode || '—';
  };

  return (
    <PageShell>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{t('profile.history.title')}</h1>
        <p className="mt-1 text-sm text-gray-500">{t('profile.history.subtitle')}</p>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">{t('profile.history.columnDate')}</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">{t('profile.history.columnCategory')}</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">{t('profile.history.columnMode')}</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">{t('profile.history.columnScore')}</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">{t('profile.history.columnResult')}</th>
              </tr>
            </thead>
            <tbody>
              {isLoading
                ? Array.from({ length: 6 }).map((_, i) => <TableRowSkeleton key={i} cols={5} />)
                : history.length === 0
                ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-400">
                        {t('common.noData')}
                      </td>
                    </tr>
                  )
                : history.map((row) => {
                    const pct = row.totalQuestions > 0
                      ? Math.round((row.score / row.totalQuestions) * 100)
                      : 0;
                    return (
                      <tr key={row.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                        <td className="px-6 py-4 text-gray-500">
                          {row.completedAt ? new Date(row.completedAt).toLocaleString('ja-JP', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                          }) : '—'}
                        </td>
                        <td className="px-6 py-4 text-gray-700">{row.category || '—'}</td>
                        <td className="px-6 py-4 text-gray-600">{modeLabel(row.mode)}</td>
                        <td className="px-6 py-4 font-medium text-gray-900">{pct}%</td>
                        <td className="px-6 py-4">
                          <Badge
                            label={t(row.status === 'pass' ? 'result.pass' : 'result.fail')}
                            variant={row.status}
                          />
                        </td>
                      </tr>
                    );
                  })}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        )}
      </div>
    </PageShell>
  );
};

export default History;
