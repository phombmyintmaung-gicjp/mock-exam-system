import { useTranslation } from 'react-i18next';
import { PageShell } from '@/components/layout/PageShell';
import { BarSkeleton } from '@/components/ui/Shimmer';
import useWeakAreas from '@/hooks/useWeakAreas';

const WeakAreas = () => {
  const { t } = useTranslation();
  const { weakAreas, isLoading } = useWeakAreas();

  return (
    <PageShell>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('profile.weakAreas.title')}</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-white/50">{t('profile.weakAreas.subtitle')}</p>
      </div>

      <div className="max-w-xl space-y-4">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 p-6 shadow-sm">
                <BarSkeleton />
              </div>
            ))
          : weakAreas.length === 0
          ? (
              <div className="rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 p-8 text-center shadow-sm">
                <p className="text-sm text-gray-400 dark:text-white/30">{t('common.noData')}</p>
              </div>
            )
          : weakAreas.map((area) => (
              <div key={area.category} className="rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 p-6 shadow-sm">
                <div className="mb-3 flex items-center justify-between">
                  <span className="font-medium text-gray-900 dark:text-white">{area.category}</span>
                  <span className={`text-sm font-semibold ${area.accuracy > 60 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                    {t('profile.weakAreas.accuracy', { value: area.accuracy })}
                  </span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-gray-100 dark:bg-white/10">
                  <div
                    className={`h-full rounded-full transition-all ${area.accuracy > 60 ? 'bg-emerald-400' : 'bg-red-400'}`}
                    style={{ width: `${area.accuracy}%` }}
                  />
                </div>
                <p className="mt-1.5 text-xs text-gray-400 dark:text-white/40">
                  {area.wrongCount} {t('profile.weakAreas.wrong')} / {area.totalAttempted} {t('profile.weakAreas.total')}
                </p>
              </div>
            ))}
      </div>
    </PageShell>
  );
};

export default WeakAreas;
