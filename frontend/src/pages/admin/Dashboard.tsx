import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { PageShell } from '@/components/layout/PageShell';
import { Badge } from '@/components/ui/Badge';
import { StatCardSkeleton, TableRowSkeleton } from '@/components/ui/Shimmer';
import { getCategoryStats } from '@/services/analyticsService';
import { getAdminUsers } from '@/services/userService';
import { getAdminQuestions } from '@/services/questionService';
import type { CategoryStat } from '@/types/analytics';
import type { HistoryItem } from '@/types/result';
import { getResultHistory } from '@/services/resultService';

const Dashboard = () => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);
  const [categoryStats, setCategoryStats] = useState<CategoryStat[]>([]);
  const [recentExams, setRecentExams] = useState<HistoryItem[]>([]);
  const [totalUsers, setTotalUsers] = useState<number | null>(null);
  const [totalQuestions, setTotalQuestions] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([getCategoryStats(), getResultHistory(), getAdminUsers(), getAdminQuestions()])
      .then(([stats, history, usersRes, questionsRes]) => {
        if (cancelled) return;
        setCategoryStats(stats);
        setRecentExams(history.slice(0, 6));
        setTotalUsers(usersRes.count);
        setTotalQuestions(questionsRes.count);
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setIsLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const totalExams = categoryStats.reduce((s, c) => s + c.totalAttempts, 0);
  const overallPass = categoryStats.reduce((s, c) => s + c.passCount, 0);
  const passRate = totalExams > 0 ? Math.round((overallPass / totalExams) * 100) : 0;

  const statCards = [
    { labelKey: 'admin.dashboard.totalQuestions', value: totalQuestions !== null ? String(totalQuestions) : '—', textColor: 'text-amber-300', accent: 'from-amber-500 to-orange-500' },
    { labelKey: 'admin.dashboard.totalUsers',     value: totalUsers !== null ? String(totalUsers) : '—',         textColor: 'text-emerald-300', accent: 'from-emerald-500 to-teal-500' },
    { labelKey: 'admin.dashboard.passRate',       value: totalExams ? `${passRate}%` : '—',                     textColor: 'text-orange-300', accent: 'from-orange-500 to-amber-400' },
    { labelKey: 'admin.dashboard.examsToday',     value: String(recentExams.length || '—'),                     textColor: 'text-amber-300', accent: 'from-orange-500 to-amber-500' },
  ];

  return (
    <PageShell>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t('admin.dashboard.title')}</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-white/50">{t('admin.dashboard.subtitle')}</p>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
          : statCards.map((stat) => (
              <div key={stat.labelKey} className="glass-card overflow-hidden rounded-2xl shadow-lg shadow-black/8 dark:shadow-black/20">
                <div className={`h-1 bg-gradient-to-r ${stat.accent}`} />
                <div className="p-5">
                  <p className="text-sm font-medium text-slate-500 dark:text-white/50">{t(stat.labelKey)}</p>
                  <p className={`mt-2 text-3xl font-bold ${stat.textColor}`}>{stat.value}</p>
                </div>
              </div>
            ))}
      </div>

      <div className="glass-card rounded-2xl shadow-xl shadow-black/8 dark:shadow-black/20">
        <div className="border-b border-slate-100 dark:border-white/8 px-6 py-4">
          <h2 className="text-base font-semibold text-slate-800 dark:text-white/90">{t('admin.dashboard.recentExams')}</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-slate-100 dark:border-white/8 bg-black/5 dark:bg-white/5">
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-white/40">{t('admin.questions.columnCategory')}</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-white/40">{t('profile.history.columnScore')}</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-white/40">{t('profile.history.columnResult')}</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-white/40">{t('profile.history.columnDate')}</th>
              </tr>
            </thead>
            <tbody>
              {isLoading
                ? Array.from({ length: 6 }).map((_, i) => <TableRowSkeleton key={i} cols={4} />)
                : recentExams.length === 0
                ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-sm text-slate-300 dark:text-white/30">
                        {t('common.noData')}
                      </td>
                    </tr>
                  )
                : recentExams.map((exam) => (
                    <tr key={exam.id} className="border-b border-slate-100 dark:border-white/5 last:border-0 transition-colors hover:bg-black/5 dark:hover:bg-white/5">
                      <td className="px-6 py-4 text-slate-600 dark:text-white/70">{exam.category || '—'}</td>
                      <td className="px-6 py-4 font-medium text-slate-800 dark:text-white/90">
                        {exam.totalQuestions > 0
                          ? `${Math.round((exam.score / exam.totalQuestions) * 100)}%`
                          : '—'}
                      </td>
                      <td className="px-6 py-4">
                        <Badge
                          label={t(exam.status === 'pass' ? 'result.pass' : 'result.fail')}
                          variant={exam.status}
                        />
                      </td>
                      <td className="px-6 py-4 text-slate-400 dark:text-white/45">
                        {exam.completedAt ? new Date(exam.completedAt).toLocaleDateString() : '—'}
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

export default Dashboard;
