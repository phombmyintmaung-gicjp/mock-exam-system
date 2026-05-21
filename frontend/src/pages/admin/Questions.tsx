import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { PageShell } from '@/components/layout/PageShell';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { TableRowSkeleton } from '@/components/ui/Shimmer';
import useQuestions from '@/hooks/useQuestions';
import { deleteQuestion } from '@/services/questionService';
import type { Difficulty } from '@/types/exam';

const Questions = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [difficulty, setDifficulty] = useState('');

  const params: Record<string, string> = {};
  if (difficulty) params.difficulty = difficulty;

  const { questions, isLoading, refetch } = useQuestions(params);

  const filtered = search
    ? questions.filter((q) => q.text.toLowerCase().includes(search.toLowerCase()))
    : questions;

  const difficultyLabel: Record<Difficulty, string> = {
    easy: t('common.difficulty.easy'),
    medium: t('common.difficulty.medium'),
    hard: t('common.difficulty.hard'),
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm(t('common.confirmDelete'))) return;
    await deleteQuestion(id);
    refetch();
  };

  return (
    <PageShell>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('admin.questions.title')}</h1>
          <p className="mt-1 text-sm text-gray-500">{t('admin.questions.subtitle')}</p>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button label={t('admin.questions.importButton')} variant="secondary" onClick={() => navigate('/admin/questions/import')} />
          <Button label={t('admin.questions.newButton')} onClick={() => navigate('/admin/questions/new')} />
        </div>
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('admin.questions.searchPlaceholder')}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:max-w-sm"
        />
        <select
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:border-blue-500 focus:outline-none"
        >
          <option value="">{t('admin.questions.allDifficulties')}</option>
          <option value="easy">{t('common.difficulty.easy')}</option>
          <option value="medium">{t('common.difficulty.medium')}</option>
          <option value="hard">{t('common.difficulty.hard')}</option>
        </select>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">{t('admin.questions.columnQuestion')}</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">{t('admin.questions.columnCategory')}</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">{t('admin.questions.columnDifficulty')}</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">{t('admin.questions.columnActions')}</th>
              </tr>
            </thead>
            <tbody>
              {isLoading
                ? Array.from({ length: 6 }).map((_, i) => <TableRowSkeleton key={i} cols={4} />)
                : filtered.length === 0
                ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-sm text-gray-400">{t('common.noData')}</td>
                    </tr>
                  )
                : filtered.map((q) => (
                    <tr key={q.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                      <td className="max-w-xs px-6 py-4 text-gray-900">
                        <span className="line-clamp-2">{q.text}</span>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{q.category}</td>
                      <td className="px-6 py-4">
                        <Badge label={difficultyLabel[q.difficulty]} variant={q.difficulty} />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-3">
                          <button
                            className="text-xs font-medium text-blue-600 hover:text-blue-800"
                            onClick={() => navigate(`/admin/questions/${q.id}/edit`)}
                          >
                            {t('common.edit')}
                          </button>
                          <button
                            className="text-xs font-medium text-red-500 hover:text-red-700"
                            onClick={() => handleDelete(q.id)}
                          >
                            {t('common.delete')}
                          </button>
                        </div>
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

export default Questions;
