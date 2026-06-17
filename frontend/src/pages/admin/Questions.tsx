import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { clsx } from 'clsx';
import { PageShell } from '@/components/layout/PageShell';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { TableRowSkeleton } from '@/components/ui/Shimmer';
import useQuestions from '@/hooks/useQuestions';
import { deleteQuestion } from '@/services/questionService';
import type { Difficulty, JLPTLevel, JLPTTestType } from '@/types/exam';

type Tab = 'it' | 'jlpt';

const JLPT_LEVELS: JLPTLevel[] = ['N1', 'N2', 'N3', 'N4', 'N5'];

const QUESTION_TYPES: Record<JLPTTestType | 'all', string[]> = {
  all:     ['問題1', '問題2', '問題3', '問題4', '問題5', 'もんだい１', 'もんだい２', 'もんだい３', 'もんだい４', 'もんだい５', 'もんだい６'],
  '文字語彙': ['問題1', '問題2', '問題3', '問題4', '問題5'],
  '文法読解': ['もんだい１', 'もんだい２', 'もんだい３', 'もんだい４', 'もんだい５', 'もんだい６'],
};

const parseJLPT = (category: string): { level: string; section: string } => {
  // "JLPT-N5-文字語彙" → { level: "N5", section: "文字語彙" }
  const parts = category.split('-');
  return { level: parts[1] ?? '', section: parts.slice(2).join('-') };
};

const Questions = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [tab, setTab] = useState<Tab>('it');
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // IT filters
  const [itSearch, setItSearch] = useState('');
  const [itDifficulty, setItDifficulty] = useState('');

  // JLPT filters
  const [jlptLevel, setJlptLevel] = useState<JLPTLevel | 'all'>('all');
  const [jlptSection, setJlptSection] = useState<JLPTTestType | 'all'>('all');
  const [jlptType, setJlptType] = useState('');

  const itParams: Record<string, string> = { group: 'it', per_page: '300' };
  if (itDifficulty) itParams.difficulty = itDifficulty;

  const jlptParams: Record<string, string> = { group: 'jlpt', per_page: '500' };

  const { questions: itAll, isLoading: itLoading, refetch: itRefetch } = useQuestions(
    tab === 'it' ? itParams : undefined,
  );
  const { questions: jlptAll, isLoading: jlptLoading, refetch: jlptRefetch } = useQuestions(
    tab === 'jlpt' ? jlptParams : undefined,
  );

  const diffLabel: Record<Difficulty, string> = {
    easy:   t('common.difficulty.easy'),
    medium: t('common.difficulty.medium'),
    hard:   t('common.difficulty.hard'),
  };

  // Client-side filter for IT
  const itQuestions = itSearch
    ? itAll.filter((q) => q.text.toLowerCase().includes(itSearch.toLowerCase()))
    : itAll;

  // Client-side filter for JLPT
  const jlptQuestions = jlptAll.filter((q) => {
    const { level, section } = parseJLPT(q.category);
    if (jlptLevel !== 'all' && level !== jlptLevel) return false;
    if (jlptSection !== 'all' && section !== jlptSection) return false;
    if (jlptType && q.question_type !== jlptType) return false;
    return true;
  });

  const handleDeleteConfirm = async () => {
    if (!deleteTargetId) return;
    setIsDeleting(true);
    try {
      await deleteQuestion(deleteTargetId);
      tab === 'it' ? itRefetch() : jlptRefetch();
    } finally {
      setIsDeleting(false);
      setDeleteTargetId(null);
    }
  };

  const switchTab = (next: Tab) => {
    setTab(next);
    setItSearch('');
    setItDifficulty('');
    setJlptLevel('all');
    setJlptSection('all');
    setJlptType('');
  };

  const isLoading = tab === 'it' ? itLoading : jlptLoading;
  const questions  = tab === 'it' ? itQuestions : jlptQuestions;

  return (
    <PageShell>
      {/* Header */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t('admin.questions.title')}</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-white/50">{t('admin.questions.subtitle')}</p>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button label={t('admin.questions.importButton')} variant="secondary" onClick={() => navigate('/admin/questions/import')} />
          <Button label={t('admin.questions.newButton')} onClick={() => navigate('/admin/questions/new')} />
        </div>
      </div>

      {/* Tab switcher */}
      <div className="mb-5 flex gap-1 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 p-1">
        {(['it', 'jlpt'] as Tab[]).map((t2) => (
          <button
            key={t2}
            onClick={() => switchTab(t2)}
            className={clsx(
              'flex-1 rounded-lg px-4 py-2 text-sm font-semibold transition-all',
              tab === t2
                ? 'bg-white dark:bg-white/10 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 dark:text-white/45 hover:text-slate-700 dark:hover:text-white/70',
            )}
          >
            {t2 === 'it' ? t('admin.questions.tabIT') : t('admin.questions.tabJapanese')}
          </button>
        ))}
      </div>

      {/* ── IT Filters ──────────────────────────────────────────────── */}
      {tab === 'it' && (
        <div className="mb-4 flex flex-col gap-3 sm:flex-row">
          <input
            type="search"
            value={itSearch}
            onChange={(e) => setItSearch(e.target.value)}
            placeholder={t('admin.questions.searchPlaceholder')}
            className="w-full rounded-lg border border-slate-200 dark:border-white/15 bg-white dark:bg-white/5 px-3 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/30 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 sm:max-w-sm"
          />
          <select
            value={itDifficulty}
            onChange={(e) => setItDifficulty(e.target.value)}
            className="rounded-lg border border-slate-200 dark:border-white/15 bg-white dark:bg-white/5 px-3 py-2 text-sm text-slate-700 dark:text-white/80 focus:border-amber-500 focus:outline-none"
          >
            <option value="">{t('admin.questions.allDifficulties')}</option>
            <option value="easy">{t('common.difficulty.easy')}</option>
            <option value="medium">{t('common.difficulty.medium')}</option>
            <option value="hard">{t('common.difficulty.hard')}</option>
          </select>
        </div>
      )}

      {/* ── JLPT Filters ────────────────────────────────────────────── */}
      {tab === 'jlpt' && (
        <div className="mb-4 flex flex-col gap-3">
          {/* Level pills */}
          <div className="flex flex-wrap gap-2">
            {(['all', ...JLPT_LEVELS] as const).map((lv) => (
              <button
                key={lv}
                onClick={() => { setJlptLevel(lv); setJlptType(''); }}
                className={clsx(
                  'rounded-lg px-3 py-1.5 text-xs font-bold transition-all',
                  jlptLevel === lv
                    ? 'bg-amber-500 text-white shadow-sm'
                    : 'border border-slate-200 dark:border-white/15 bg-white dark:bg-white/5 text-slate-600 dark:text-white/60 hover:bg-slate-50 dark:hover:bg-white/10',
                )}
              >
                {lv === 'all' ? t('admin.questions.allLevels') : lv}
              </button>
            ))}
          </div>

          {/* Section + type dropdowns */}
          <div className="flex flex-wrap gap-3">
            <select
              value={jlptSection}
              onChange={(e) => { setJlptSection(e.target.value as JLPTTestType | 'all'); setJlptType(''); }}
              className="rounded-lg border border-slate-200 dark:border-white/15 bg-white dark:bg-white/5 px-3 py-2 text-sm text-slate-700 dark:text-white/80 focus:border-amber-500 focus:outline-none"
            >
              <option value="all">{t('admin.questions.allSections')}</option>
              <option value="文字語彙">{t('admin.questions.sectionMojiGoi')}</option>
              <option value="文法読解">{t('admin.questions.sectionBunpo')}</option>
            </select>

            <select
              value={jlptType}
              onChange={(e) => setJlptType(e.target.value)}
              className="rounded-lg border border-slate-200 dark:border-white/15 bg-white dark:bg-white/5 px-3 py-2 text-sm text-slate-700 dark:text-white/80 focus:border-amber-500 focus:outline-none"
            >
              <option value="">{t('admin.questions.allTypes')}</option>
              {(jlptSection === 'all' ? QUESTION_TYPES.all : QUESTION_TYPES[jlptSection]).map((qt) => (
                <option key={qt} value={qt}>{qt}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5">
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-white/45">
                  {t('admin.questions.columnQuestion')}
                </th>
                {tab === 'it' ? (
                  <>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-white/45">
                      {t('admin.questions.columnCategory')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-white/45">
                      {t('admin.questions.columnDifficulty')}
                    </th>
                  </>
                ) : (
                  <>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-white/45">
                      {t('admin.questions.columnLevel')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-white/45">
                      {t('admin.questions.columnSection')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-white/45">
                      {t('admin.questions.columnType')}
                    </th>
                  </>
                )}
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-white/45">
                  {t('admin.questions.columnActions')}
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading
                ? Array.from({ length: 6 }).map((_, i) => (
                    <TableRowSkeleton key={i} cols={tab === 'it' ? 4 : 5} />
                  ))
                : questions.length === 0
                ? (
                    <tr>
                      <td colSpan={tab === 'it' ? 4 : 5} className="px-6 py-8 text-center text-sm text-slate-400 dark:text-white/30">
                        {t('common.noData')}
                      </td>
                    </tr>
                  )
                : questions.map((q) => {
                    const { level, section } = parseJLPT(q.category);
                    return (
                      <tr key={q.id} className="border-b border-slate-100 dark:border-white/5 last:border-0 hover:bg-slate-50 dark:hover:bg-white/5">
                        <td className="max-w-xs px-6 py-4 text-slate-900 dark:text-white">
                          <span className="line-clamp-2">{q.text}</span>
                        </td>
                        {tab === 'it' ? (
                          <>
                            <td className="px-6 py-4 text-slate-600 dark:text-white/60">{q.category}</td>
                            <td className="px-6 py-4">
                              <Badge label={diffLabel[q.difficulty]} variant={q.difficulty} />
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="px-6 py-4">
                              <span className="inline-block rounded-full bg-amber-100 dark:bg-amber-500/20 px-2.5 py-0.5 text-xs font-bold text-amber-700 dark:text-amber-300">
                                {level}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-slate-600 dark:text-white/60">{section}</td>
                            <td className="px-6 py-4 text-slate-600 dark:text-white/60 font-mono text-xs">
                              {q.question_type ?? '—'}
                            </td>
                          </>
                        )}
                        <td className="px-6 py-4">
                          <div className="flex gap-3">
                            <button
                              className="text-xs font-medium text-amber-600 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-300"
                              onClick={() => navigate(`/admin/questions/${q.id}/edit`)}
                            >
                              {t('common.edit')}
                            </button>
                            <button
                              className="text-xs font-medium text-rose-500 hover:text-rose-700"
                              onClick={() => setDeleteTargetId(q.id)}
                            >
                              {t('common.delete')}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Row count */}
      {!isLoading && questions.length > 0 && (
        <p className="mt-3 text-xs text-slate-400 dark:text-white/30">
          {t('admin.questions.rowCount', { count: questions.length })}
        </p>
      )}

      <Modal
        isOpen={deleteTargetId !== null}
        title={t('common.deleteConfirmTitle')}
        onClose={() => setDeleteTargetId(null)}
      >
        <p className="mb-6 text-sm text-slate-600 dark:text-white/70">{t('common.deleteConfirmMessage')}</p>
        <div className="flex justify-end gap-3">
          <Button label={t('common.cancel')} variant="secondary" onClick={() => setDeleteTargetId(null)} disabled={isDeleting} />
          <Button label={isDeleting ? t('common.loading') : t('common.delete')} variant="danger" onClick={handleDeleteConfirm} disabled={isDeleting} />
        </div>
      </Modal>
    </PageShell>
  );
};

export default Questions;
