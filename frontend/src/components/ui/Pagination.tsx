import { useTranslation } from 'react-i18next';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination = ({ currentPage, totalPages, onPageChange }: PaginationProps) => {
  const { t } = useTranslation();

  return (
    <nav className="flex items-center justify-between border-t border-slate-200 dark:border-white/10 px-4 py-3">
      <p className="text-sm text-slate-600 dark:text-white/60">
        {t('common.pageOf', { current: currentPage, total: totalPages })}
      </p>
      <div className="flex gap-2">
        <button
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="rounded-md border border-slate-300 dark:border-white/15 bg-white dark:bg-white/5 px-3 py-1.5 text-sm font-medium text-slate-700 dark:text-white/70 hover:bg-slate-50 dark:hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {t('exam.prev')}
        </button>
        <button
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="rounded-md border border-slate-300 dark:border-white/15 bg-white dark:bg-white/5 px-3 py-1.5 text-sm font-medium text-slate-700 dark:text-white/70 hover:bg-slate-50 dark:hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {t('exam.next')}
        </button>
      </div>
    </nav>
  );
};

export { Pagination };
