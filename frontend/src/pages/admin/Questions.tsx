import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { clsx } from 'clsx';
import { PageShell } from '@/components/layout/PageShell';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Pagination } from '@/components/ui/Pagination';
import { TableRowSkeleton } from '@/components/ui/Shimmer';
import useQuestions from '@/hooks/useQuestions';
import { deleteQuestion } from '@/services/questionService';
import { JLPT_LEVELS, MONDAI_VOCAB, MONDAI_GRAMMAR } from '@/constants';
import type { JLPTLevel, JLPTTestType, AdminQuestion } from '@/types/exam';

type Tab = 'it' | 'jlpt';

const QUESTION_TYPES: Record<JLPTTestType | 'all', string[]> = {
  all:     ['問題1', '問題2', '問題3', '問題4', '問題5', '問題6'],
  '文字語彙': ['問題1', '問題2', '問題3', '問題4', '問題5'],
  '文法読解': ['問題1', '問題2', '問題3', '問題4', '問題5', '問題6'],
};

const parseJLPT = (category: string): { level: string; section: string } => {
  // "JLPT-N5-文字語彙" → { level: "N5", section: "文字語彙" }
  const parts = category.split('-');
  return { level: parts[1] ?? '', section: parts.slice(2).join('-') };
};

interface CoverageMatrixProps {
  questions: AdminQuestion[];
  onCellClick: (level: JLPTLevel, section: JLPTTestType, type: string) => void;
}

function CoverageMatrix({ questions, onCellClick }: CoverageMatrixProps) {
  const { t } = useTranslation();
  const [section, setSection] = useState<JLPTTestType>('文字語彙');

  const mondai: readonly string[] = section === '文字語彙' ? MONDAI_VOCAB : MONDAI_GRAMMAR;

  const counts = useMemo(() => {
    const m = section === '文字語彙' ? MONDAI_VOCAB : MONDAI_GRAMMAR;
    const map: Record<string, Record<string, number>> = {};
    for (const level of JLPT_LEVELS) {
      map[level] = {};
      for (const q of m) map[level][q] = 0;
    }
    for (const q of questions) {
      const { level, section: qSection } = parseJLPT(q.category);
      if (qSection !== section || !q.question_type || !map[level]) continue;
      if (map[level][q.question_type] !== undefined) map[level][q.question_type]++;
    }
    return map;
  }, [questions, section]);

  const fullCounts = useMemo(() => {
    const map: Partial<Record<JLPTLevel, number>> = { N1: 0, N2: 0 };
    for (const q of questions) {
      const { level, section: qSection } = parseJLPT(q.category);
      if (qSection !== 'Full') continue;
      if (level === 'N1') map['N1'] = (map['N1'] ?? 0) + 1;
      if (level === 'N2') map['N2'] = (map['N2'] ?? 0) + 1;
    }
    return map;
  }, [questions]);

  const cellCls = (n: number) =>
    n === 0
      ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 ring-1 ring-rose-200 dark:ring-rose-800'
      : n < 5
      ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
      : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400';

  return (
    <div className="mb-5 overflow-hidden rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 dark:border-white/10 px-4 py-3">
        <div>
          <span className="text-sm font-semibold text-slate-700 dark:text-white/80">
            {t('admin.questions.coverageTitle')}
          </span>
          <span className="ml-2 hidden text-xs text-slate-400 dark:text-white/30 sm:inline">
            {t('admin.questions.coverageLegend')}
          </span>
        </div>
        <div className="flex overflow-hidden rounded-lg border border-slate-200 dark:border-white/15">
          {(['文字語彙', '文法読解'] as JLPTTestType[]).map((s) => (
            <button
              key={s}
              onClick={() => setSection(s)}
              className={clsx(
                'px-3 py-1 text-xs font-medium transition-colors',
                section === s
                  ? 'bg-amber-500 text-white'
                  : 'text-slate-500 dark:text-white/45 hover:bg-slate-50 dark:hover:bg-white/10',
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Matrix grid */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr>
              <th className="w-12 px-4 py-2 text-left font-medium text-slate-400 dark:text-white/30">
                {t('admin.questions.columnLevel')}
              </th>
              {mondai.map((m) => (
                <th key={m} className="min-w-[52px] px-2 py-2 text-center font-medium text-slate-500 dark:text-white/45">
                  {m}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(JLPT_LEVELS as JLPTLevel[]).map((level) => (
              <tr key={level} className="border-t border-slate-100 dark:border-white/5">
                <td className="px-4 py-2 font-bold text-slate-600 dark:text-white/60">{level}</td>
                {mondai.map((m) => {
                  const n = counts[level]?.[m] ?? 0;
                  return (
                    <td key={m} className="px-2 py-1.5 text-center">
                      <button
                        onClick={() => onCellClick(level, section, m)}
                        title={`${level} ${section} ${m}: ${n}`}
                        className={clsx(
                          'w-10 rounded-md py-1 text-xs font-bold transition-opacity hover:opacity-70',
                          cellCls(n),
                        )}
                      >
                        {n}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Full Exam row (N1/N2) */}
      <div className="flex flex-wrap items-center gap-4 border-t border-slate-100 dark:border-white/5 px-4 py-2.5">
        <span className="text-xs font-medium text-slate-500 dark:text-white/45">
          {t('admin.questions.coverageFullExam')}:
        </span>
        {(['N1', 'N2'] as JLPTLevel[]).map((lv) => (
          <span key={lv} className="text-xs text-slate-600 dark:text-white/60">
            {lv} — <span className="font-bold">{fullCounts[lv] ?? 0}</span> qs
          </span>
        ))}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-3 border-t border-slate-100 dark:border-white/5 px-4 py-2">
        <span className="text-xs text-slate-400 dark:text-white/30">{t('admin.questions.coverageLegendLabel')}:</span>
        <span className="rounded px-1.5 py-0.5 text-xs font-medium bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400">
          0 — {t('admin.questions.coverageGap')}
        </span>
        <span className="rounded px-1.5 py-0.5 text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
          1–4 — {t('admin.questions.coverageLow')}
        </span>
        <span className="rounded px-1.5 py-0.5 text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
          5+ — {t('admin.questions.coverageGood')}
        </span>
      </div>
    </div>
  );
}

const Questions = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [tab, setTab] = useState<Tab>('it');
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [page, setPage] = useState(1);

  // IT filters
  const [itSearch, setItSearch] = useState('');

  // JLPT filters
  const [jlptLevel, setJlptLevel] = useState<JLPTLevel | 'all'>('all');
  const [jlptSection, setJlptSection] = useState<JLPTTestType | 'all'>('all');
  const [jlptType, setJlptType] = useState('');

  // Reset to page 1 whenever active filters change
  useEffect(() => { setPage(1); }, [tab, itSearch, jlptLevel, jlptSection, jlptType]);

  const itParams: Record<string, string> = { group: 'it', per_page: '300' };

  const jlptParams: Record<string, string> = { group: 'jlpt', per_page: '500' };

  const { questions: itAll, isLoading: itLoading, refetch: itRefetch } = useQuestions(
    tab === 'it' ? itParams : undefined,
  );
  const { questions: jlptAll, isLoading: jlptLoading, refetch: jlptRefetch } = useQuestions(
    tab === 'jlpt' ? jlptParams : undefined,
  );

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

  const PAGE_SIZE = 25;
  const isLoading = tab === 'it' ? itLoading : jlptLoading;
  const filteredQuestions = tab === 'it' ? itQuestions : jlptQuestions;
  const totalPages = Math.max(1, Math.ceil(filteredQuestions.length / PAGE_SIZE));
  const pagedQuestions = filteredQuestions.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

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

  const handleCoverageClick = (level: JLPTLevel, section: JLPTTestType, type: string) => {
    setJlptLevel(level);
    setJlptSection(section);
    setJlptType(type);
  };

  const switchTab = (next: Tab) => {
    setTab(next);
    setItSearch('');
    // setItDifficulty('');
    setJlptLevel('all');
    setJlptSection('all');
    setJlptType('');
  };

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
        <div className="mb-4">
          <input
            type="search"
            value={itSearch}
            onChange={(e) => setItSearch(e.target.value)}
            placeholder={t('admin.questions.searchPlaceholder')}
            className="w-full rounded-lg border border-slate-200 dark:border-white/15 bg-white dark:bg-white/5 px-3 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/30 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 sm:max-w-sm"
          />
        </div>
      )}

      {/* ── JLPT Coverage Matrix ────────────────────────────────────── */}
      {tab === 'jlpt' && !jlptLoading && (
        <CoverageMatrix questions={jlptAll} onCellClick={handleCoverageClick} />
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
              className="rounded-lg border border-slate-200 dark:border-white/15 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-700 dark:text-white/80 focus:border-amber-500 focus:outline-none"
            >
              <option value="all">{t('admin.questions.allSections')}</option>
              <option value="文字語彙">{t('admin.questions.sectionMojiGoi')}</option>
              <option value="文法読解">{t('admin.questions.sectionBunpo')}</option>
            </select>

            <select
              value={jlptType}
              onChange={(e) => setJlptType(e.target.value)}
              className="rounded-lg border border-slate-200 dark:border-white/15 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-700 dark:text-white/80 focus:border-amber-500 focus:outline-none"
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
                    <TableRowSkeleton key={i} cols={tab === 'it' ? 3 : 5} />
                  ))
                : filteredQuestions.length === 0
                ? (
                    <tr>
                      <td colSpan={tab === 'it' ? 3 : 5} className="px-6 py-8 text-center text-sm text-slate-400 dark:text-white/30">
                        {t('common.noData')}
                      </td>
                    </tr>
                  )
                : pagedQuestions.map((q) => {
                    const { level, section } = parseJLPT(q.category);
                    return (
                      <tr key={q.id} className="border-b border-slate-100 dark:border-white/5 last:border-0 hover:bg-slate-50 dark:hover:bg-white/5">
                        <td className="max-w-xs px-6 py-4 text-slate-900 dark:text-white">
                          <span className="line-clamp-2">{q.text}</span>
                        </td>
                        {tab === 'it' ? (
                          <>
                            <td className="px-6 py-4 text-slate-600 dark:text-white/60">{q.category}</td>
                          </>
                        ) : (
                          <>
                            <td className="px-6 py-4">
                              <span className="inline-block rounded-full bg-amber-100 dark:bg-amber-500/20 px-2.5 py-0.5 text-xs font-bold text-amber-700 dark:text-amber-300">
                                {level}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-slate-600 dark:text-white/60 whitespace-nowrap">
                              {section}
                            </td>
                            <td className="px-6 py-4 text-slate-600 dark:text-white/60 font-mono text-xs">
                              {q.question_type ?? '—'}
                            </td>
                          </>
                        )}
                        <td className="px-6 py-4">
                          <div className="flex gap-3">
                            <button
                              className="text-xs font-medium text-amber-600 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-300 whitespace-nowrap"
                              onClick={() => navigate(`/admin/questions/${q.id}/edit`)}
                            >
                              {t('common.edit')}
                            </button>
                            <button
                              className="text-xs font-medium text-rose-500 hover:text-rose-700 whitespace-nowrap dark:text-rose-400 dark:hover:text-rose-300"
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

      {/* Pagination + row count */}
      {!isLoading && filteredQuestions.length > 0 && (
        <div className="mt-1 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <p className="px-1 text-xs text-slate-400 dark:text-white/30">
            {t('admin.questions.rowCount', { count: filteredQuestions.length })}
          </p>
          {totalPages > 1 && (
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
          )}
        </div>
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
