import { useTranslation } from 'react-i18next';
import { PageShell } from '@/components/layout/PageShell';
import useQuestionIncorrectStats from '@/hooks/useQuestionIncorrectStats';

// Read-only view of how often each question has been answered incorrectly, aggregated across
// all users and organized by category. Employee-facing counterpart to the admin difficult-
// questions report — does not modify or share state with that admin-only feature.
const QuestionStats = () => {
  const { t } = useTranslation();
  const { groups, isLoading, error } = useQuestionIncorrectStats();

  return (
    <PageShell>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('profile.questionStats.title')}</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-white/50">{t('profile.questionStats.subtitle')}</p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 p-6 shadow-sm">
              <div className="h-4 w-1/3 animate-pulse rounded bg-gray-100 dark:bg-white/10" />
              <div className="mt-4 h-24 w-full animate-pulse rounded bg-gray-50 dark:bg-white/5" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 p-8 text-center shadow-sm">
          <p className="text-sm text-rose-500">{t('common.error')}</p>
        </div>
      ) : groups.length === 0 ? (
        <div className="rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 p-8 text-center shadow-sm">
          <p className="text-sm text-gray-400 dark:text-white/30">{t('profile.questionStats.empty')}</p>
        </div>
      ) : (
        <div className="space-y-6">
          {groups.map((group) => (
            <div key={group.category} className="rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <span className="rounded-full bg-amber-50 dark:bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-700 dark:text-amber-400">
                  {group.category}
                </span>
                <span className="text-xs text-gray-400 dark:text-white/40">
                  {t('profile.questionStats.questionCount', { count: group.questions.length })}
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-[640px] w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-white/10 text-left text-xs font-medium text-gray-500 dark:text-white/40 uppercase tracking-wide">
                      <th className="pb-3 pr-4">{t('profile.questionStats.columnQuestion')}</th>
                      <th className="pb-3 pr-4 text-right">{t('profile.questionStats.columnAttempts')}</th>
                      <th className="pb-3 text-right">{t('profile.questionStats.columnIncorrect')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-white/5">
                    {group.questions.map((q) => (
                      <tr key={q.questionId} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                        <td className="py-3 pr-4 max-w-sm">
                          <span className="line-clamp-2 text-gray-800 dark:text-white/80">{q.questionText}</span>
                          {q.questionType && (
                            <span className="mt-0.5 block text-xs text-gray-400 dark:text-white/30">{q.questionType}</span>
                          )}
                        </td>
                        <td className="py-3 pr-4 text-right text-gray-500 dark:text-white/50">{q.attemptCount}</td>
                        <td className="py-3 text-right font-semibold tabular-nums text-rose-600 dark:text-rose-400">
                          {q.incorrectCount}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </PageShell>
  );
};

export default QuestionStats;
