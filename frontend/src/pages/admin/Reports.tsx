import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { PageShell } from '@/components/layout/PageShell';
import { Button } from '@/components/ui/Button';
import { BarSkeleton } from '@/components/ui/Shimmer';
import { getCategoryStats } from '@/services/analyticsService';
import type { CategoryStat } from '@/types/analytics';

interface StatBarProps {
  label: string;
  passRate: number;
  examCountLabel: string;
  color: string;
}

const StatBar = ({ label, passRate, examCountLabel, color }: StatBarProps) => (
  <div>
    <div className="mb-1.5 flex items-center justify-between">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <span className="text-sm font-bold text-gray-900">{passRate}%</span>
    </div>
    <div className="h-3 w-full overflow-hidden rounded-full bg-gray-100">
      <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${passRate}%` }} />
    </div>
    <p className="mt-1 text-xs text-gray-400">{examCountLabel}</p>
  </div>
);

const Reports = () => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);
  const [categoryStats, setCategoryStats] = useState<CategoryStat[]>([]);

  useEffect(() => {
    let cancelled = false;
    getCategoryStats()
      .then((stats) => { if (!cancelled) setCategoryStats(stats); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setIsLoading(false); });
    return () => { cancelled = true; };
  }, []);

  return (
    <PageShell>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('admin.reports.title')}</h1>
          <p className="mt-1 text-sm text-gray-500">{t('admin.reports.subtitle')}</p>
        </div>
        <Button label={t('admin.reports.exportButton')} variant="secondary" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-6 text-base font-semibold text-gray-900">{t('admin.reports.passByCategory')}</h2>
          <div className="space-y-5">
            {isLoading
              ? Array.from({ length: 3 }).map((_, i) => <BarSkeleton key={i} />)
              : categoryStats.length === 0
              ? <p className="text-sm text-gray-400">{t('common.noData')}</p>
              : categoryStats.map((stat) => (
                  <StatBar
                    key={stat.category}
                    label={stat.category}
                    passRate={stat.passRate}
                    examCountLabel={t('admin.reports.examCount', { count: stat.totalAttempts })}
                    color="bg-blue-500"
                  />
                ))}
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-6 text-base font-semibold text-gray-900">{t('admin.reports.passByDepartment')}</h2>
          <div className="space-y-5">
            {isLoading
              ? Array.from({ length: 3 }).map((_, i) => <BarSkeleton key={i} />)
              : <p className="text-sm text-gray-400">{t('common.noData')}</p>}
          </div>
        </div>
      </div>
    </PageShell>
  );
};

export default Reports;
