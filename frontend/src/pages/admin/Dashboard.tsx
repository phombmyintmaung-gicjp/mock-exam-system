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
    { labelKey: 'admin.dashboard.totalQuestions', value: totalQuestions !== null ? String(totalQuestions) : '—', color: 'text-blue-600' },
    { labelKey: 'admin.dashboard.totalUsers',     value: totalUsers !== null ? String(totalUsers) : '—',         color: 'text-green-600' },
    { labelKey: 'admin.dashboard.passRate',       value: totalExams ? `${passRate}%` : '—',                     color: 'text-purple-600' },
    { labelKey: 'admin.dashboard.examsToday',     value: String(recentExams.length || '—'),                     color: 'text-orange-500' },
  ];

  return (
    <PageShell>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{t('admin.dashboard.title')}</h1>
        <p className="mt-1 text-sm text-gray-500">{t('admin.dashboard.subtitle')}</p>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
          : statCards.map((stat) => (
              <div key={stat.labelKey} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <p className="text-sm font-medium text-gray-500">{t(stat.labelKey)}</p>
                <p className={`mt-2 text-3xl font-bold ${stat.color}`}>{stat.value}</p>
              </div>
            ))}
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-base font-semibold text-gray-900">{t('admin.dashboard.recentExams')}</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">{t('admin.questions.columnCategory')}</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">{t('profile.history.columnScore')}</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">{t('profile.history.columnResult')}</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">{t('profile.history.columnDate')}</th>
              </tr>
            </thead>
            <tbody>
              {isLoading
                ? Array.from({ length: 6 }).map((_, i) => <TableRowSkeleton key={i} cols={4} />)
                : recentExams.length === 0
                ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-sm text-gray-400">
                        {t('common.noData')}
                      </td>
                    </tr>
                  )
                : recentExams.map((exam) => (
                    <tr key={exam.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                      <td className="px-6 py-4 text-gray-700">{exam.category || '—'}</td>
                      <td className="px-6 py-4 font-medium text-gray-900">
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
                      <td className="px-6 py-4 text-gray-500">
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
