import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { clsx } from 'clsx';
import { PageShell } from '@/components/layout/PageShell';
import { Button } from '@/components/ui/Button';
import { BarSkeleton } from '@/components/ui/Shimmer';
import { getCategoryStats, getDifficultQuestions } from '@/services/analyticsService';
import type { CategoryStat, DifficultyStats } from '@/types/analytics';

interface StatBarProps {
  label: string;
  passRate: number;
  examCountLabel: string;
  color: string;
}

const StatBar = ({ label, passRate, examCountLabel, color }: StatBarProps) => (
  <div>
    <div className="mb-1.5 flex items-center justify-between">
      <span className="text-sm font-medium text-gray-700 dark:text-white/80">{label}</span>
      <span className="text-sm font-bold text-gray-900 dark:text-white">{passRate}%</span>
    </div>
    <div className="h-3 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-white/10">
      <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${passRate}%` }} />
    </div>
    <p className="mt-1 text-xs text-gray-400 dark:text-white/40">{examCountLabel}</p>
  </div>
);

const Reports = () => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);
  const [categoryStats, setCategoryStats] = useState<CategoryStat[]>([]);
  const [difficultQuestions, setDifficultQuestions] = useState<DifficultyStats[]>([]);
  const [difficultLoading, setDifficultLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getCategoryStats()
      .then((stats) => { if (!cancelled) setCategoryStats(stats); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setIsLoading(false); });
    getDifficultQuestions()
      .then((qs) => { if (!cancelled) setDifficultQuestions(qs); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setDifficultLoading(false); });
    return () => { cancelled = true; };
  }, []);

  return (
    <PageShell>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('admin.reports.title')}</h1>
          {/* <p className="mt-1 text-sm text-gray-500 dark:text-white/50">{t('admin.reports.subtitle')}</p> */}
        </div>
        {/* <Button label={t('admin.reports.exportButton')} variant="secondary" /> */}
      </div>

      <div className="rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 p-6 shadow-sm">
        <h2 className="mb-6 text-base font-semibold text-gray-900 dark:text-white">{t('admin.reports.passByCategory')}</h2>
        <div className="space-y-5">
          {isLoading
            ? Array.from({ length: 3 }).map((_, i) => <BarSkeleton key={i} />)
            : categoryStats.length === 0
            ? <p className="text-sm text-gray-400 dark:text-white/30">{t('common.noData')}</p>
            : categoryStats.map((stat) => (
                <StatBar
                  key={stat.category}
                  label={stat.category}
                  passRate={stat.passRate}
                  examCountLabel={t('admin.reports.examCount', { count: stat.totalAttempts })}
                  color="bg-amber-500"
                />
              ))}
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 p-6 shadow-sm">
        <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">{t('admin.reports.difficultQuestions')}</h2>
            <p className="text-xs text-gray-400 dark:text-white/40">{t('admin.reports.difficultQuestionsSubtitle')}</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-[640px] w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-white/10 text-left text-xs font-medium text-gray-500 dark:text-white/40 uppercase tracking-wide">
                <th className="pb-3 pr-4">{t('admin.reports.columnQuestion')}</th>
                <th className="pb-3 pr-4">{t('admin.reports.columnCategory')}</th>
                <th className="pb-3 pr-4 text-right">{t('admin.reports.columnAttempts')}</th>
                <th className="pb-3 text-right">{t('admin.reports.columnCorrectRate')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-white/5">
              {difficultLoading
                ? Array.from({ length: 4 }).map((_, i) => (
                    <tr key={i}>
                      <td colSpan={4} className="py-3">
                        <div className="h-4 w-full animate-pulse rounded bg-gray-100 dark:bg-white/10" />
                      </td>
                    </tr>
                  ))
                : difficultQuestions.length === 0
                ? (
                    <tr>
                      <td colSpan={4} className="py-6 text-center text-sm text-gray-400 dark:text-white/30">
                        {t('admin.reports.noDifficultQuestions')}
                      </td>
                    </tr>
                  )
                : difficultQuestions.map((q) => (
                    <tr key={q.questionId} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                      <td className="py-3 pr-4 max-w-sm">
                        <span className="line-clamp-2 text-gray-800 dark:text-white/80">{q.questionText}</span>
                        {q.questionType && (
                          <span className="mt-0.5 block text-xs text-gray-400 dark:text-white/30">{q.questionType}</span>
                        )}
                      </td>
                      <td className="py-3 pr-4">
                        <span className="rounded-full bg-amber-50 dark:bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-700 dark:text-amber-400">
                          {q.category}
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-right text-gray-500 dark:text-white/50">{q.attemptCount}</td>
                      <td className="py-3 text-right">
                        <span className={clsx(
                          'font-semibold tabular-nums',
                          q.correctRate < 15 ? 'text-rose-600 dark:text-rose-400' : 'text-orange-500 dark:text-orange-400',
                        )}>
                          {q.correctRate}%
                        </span>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      </div>
    </PageShell>
  );
};

export default Reports;
