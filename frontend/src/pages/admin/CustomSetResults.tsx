import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { clsx } from 'clsx';
import { PageShell } from '@/components/layout/PageShell';
import { Spinner } from '@/components/ui/Spinner';
import { ChevronLeftIcon } from '@/components/ui/Icons';
import { getCustomSet, getSetResults } from '@/services/customSetService';
import type { AdminCustomExamResult } from '@/types/customSet';

const CustomSetResults = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const [setName, setSetName] = useState('');
  const [results, setResults] = useState<AdminCustomExamResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const sid = Number(id);
    Promise.all([getCustomSet(sid), getSetResults(sid)])
      .then(([set, res]) => {
        setSetName(set.name);
        setResults(res);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [id]);

  const fmt = (iso: string) =>
    new Date(iso).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' });

  return (
    <PageShell>
      <div className="mb-6">
        <Link
          to="/admin/custom-sets"
          className="mb-3 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 dark:text-white/40 dark:hover:text-white/70"
        >
          <ChevronLeftIcon className="h-3.5 w-3.5" />
          {t('admin.customSets.backToList')}
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t('admin.customSets.results')}
          {setName && <span className="ml-2 text-lg font-normal text-gray-400 dark:text-white/40">— {setName}</span>}
        </h1>
      </div>

      {isLoading ? (
        <div className="flex min-h-[30vh] items-center justify-center">
          <Spinner size="lg" />
        </div>
      ) : results.length === 0 ? (
        <p className="text-sm text-gray-400 dark:text-white/30">{t('admin.customSets.noResults')}</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5">
          <table className="min-w-[600px] w-full text-sm">
            <thead className="bg-gray-50 dark:bg-white/5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-white/40">
              <tr>
                <th className="px-5 py-3">{t('admin.customSets.colUser')}</th>
                <th className="px-5 py-3 text-center">{t('admin.customSets.colScore')}</th>
                <th className="px-5 py-3 text-center">{t('admin.customSets.colStatus')}</th>
                <th className="px-5 py-3">{t('admin.customSets.colDate')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/8">
              {results.map((r) => {
                const pct = Math.round((r.score / r.totalQuestions) * 100);
                return (
                  <tr key={r.id} className="hover:bg-gray-50 dark:hover:bg-white/4">
                    <td className="px-5 py-4">
                      <p className="font-medium text-gray-900 dark:text-white">{r.user.name}</p>
                      <p className="text-xs text-gray-400 dark:text-white/35">{r.user.email}</p>
                    </td>
                    <td className="px-5 py-4 text-center text-gray-700 dark:text-white/70">
                      {r.score} / {r.totalQuestions}
                      <span className="ml-1 text-xs text-gray-400 dark:text-white/35">({pct}%)</span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span
                        className={clsx(
                          'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
                          r.status === 'pass'
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300'
                            : 'bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-300',
                        )}
                      >
                        {r.status === 'pass' ? t('result.pass') : t('result.fail')}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-gray-500 dark:text-white/45">{fmt(r.completedAt)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </PageShell>
  );
};

export default CustomSetResults;
