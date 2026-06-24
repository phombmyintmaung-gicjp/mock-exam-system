import { useTranslation } from 'react-i18next';
import { clsx } from 'clsx';
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
          : weakAreas.map((area) => {
              const improved = area.latestScore > area.bestScore * 0.99
                ? null
                : area.latestScore >= area.bestScore - 5
                  ? 'stable'
                  : 'declining';
              const trendColor = improved === 'declining' ? 'text-rose-500 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400';

              return (
                <div key={area.category} className="rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 p-6 shadow-sm">
                  {/* Header row */}
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <span className="font-medium text-gray-900 dark:text-white">{area.category}</span>
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-slate-100 dark:bg-white/10 px-2 py-0.5 text-xs text-slate-500 dark:text-white/40">
                        {t('profile.weakAreas.attempts', { count: area.attemptCount })}
                      </span>
                      <span className={clsx('text-sm font-semibold', area.accuracy > 60 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400')}>
                        {t('profile.weakAreas.accuracy', { value: area.accuracy })}
                      </span>
                    </div>
                  </div>

                  {/* Accuracy bar */}
                  <div className="h-2.5 overflow-hidden rounded-full bg-gray-100 dark:bg-white/10">
                    <div
                      className={`h-full rounded-full transition-all ${area.accuracy > 60 ? 'bg-emerald-400' : 'bg-red-400'}`}
                      style={{ width: `${area.accuracy}%` }}
                    />
                  </div>

                  {/* Attempt stats row */}
                  <div className="mt-2 flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
                    <p className="text-xs text-gray-400 dark:text-white/40">
                      {area.wrongCount} {t('profile.weakAreas.wrong')} / {area.totalAttempted} {t('profile.weakAreas.total')}
                    </p>

                    {/* Best vs latest score */}
                    {area.attemptCount > 1 && (
                      <div className="flex items-center gap-3 text-xs">
                        <span className="text-slate-400 dark:text-white/35">
                          {t('profile.weakAreas.bestScore')}{' '}
                          <span className="font-semibold text-slate-600 dark:text-white/60">{area.bestScore}%</span>
                        </span>
                        <span className={clsx('font-medium', trendColor)}>
                          {t('profile.weakAreas.latestScore')}{' '}
                          <span className="font-semibold">{area.latestScore}%</span>
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
      </div>
    </PageShell>
  );
};

export default WeakAreas;
