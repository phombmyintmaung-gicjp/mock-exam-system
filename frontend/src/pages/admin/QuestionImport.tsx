import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { PageShell } from '@/components/layout/PageShell';
import { Button } from '@/components/ui/Button';
import { importQuestions } from '@/services/questionService';
import { CheckIcon, DownloadIcon } from '@/components/ui/Icons';

// ── Sample Excel download ─────────────────────────────────────────────────────

const SAMPLE_ROWS = [
  // header
  ['text', 'category', 'question_type', 'explanation', 'choice1', 'choice2', 'choice3', 'choice4', 'correct_index'],
  // IT example
  ['Which AWS service provides scalable object storage?', 'AWS', '', 'S3 is Amazon\'s object storage service.', 'EC2', 'S3', 'RDS', 'Lambda', 2],
  ['What does TCP stand for?', 'Network', '', 'TCP stands for Transmission Control Protocol.', 'Transfer Control Protocol', 'Transmission Control Protocol', 'Trusted Communication Protocol', 'Terminal Connection Port', 2],
  // JLPT example
  ['次の言葉の読み方として正しいものを選びなさい。「人口」', 'JLPT-N5-文字語彙', '問題1', '人口の読み方は「じんこう」です。', 'じんこう', 'にんこう', 'ひとくち', 'ひとぐち', 1],
];

const downloadSample = () => {
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(SAMPLE_ROWS);

  // Column widths
  ws['!cols'] = [
    { wch: 50 }, // text
    { wch: 22 }, // category
    { wch: 12 }, // question_type
    { wch: 40 }, // explanation
    { wch: 30 }, { wch: 30 }, { wch: 30 }, { wch: 30 }, // choices
    { wch: 14 }, // correct_index
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'Questions');
  XLSX.writeFile(wb, 'questions_template.xlsx');
};

// ── Component ─────────────────────────────────────────────────────────────────

interface ImportResult {
  imported: number;
  duplicates: number;
  skipped: number;
  errors: string[];
}

const COLUMNS = [
  { field: 'text',          required: true },
  { field: 'category',      required: true },
  { field: 'question_type', required: false },
  { field: 'explanation',   required: true },
  { field: 'choice1–4',     required: true },
  { field: 'correct_index', required: true },
] as const;

const QuestionImport = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFile = (file: File) => {
    setFileName(file.name);
    setResult(null);
    setError(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleUpload = async () => {
    const file = inputRef.current?.files?.[0];
    if (!file) return;
    setIsUploading(true);
    setResult(null);
    setError(null);
    try {
      const res = await importQuestions(file);
      setResult(res);
      if (res.imported > 0 && res.skipped === 0) {
        setTimeout(() => navigate('/admin/questions'), 1800);
      }
    } catch {
      setError(t('common.error'));
    } finally {
      setIsUploading(false);
    }
  };

  const reset = () => {
    setFileName(null);
    setResult(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <PageShell>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t('admin.questionImport.title')}</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-white/50">{t('admin.questionImport.subtitle')}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* ── Upload panel ── */}
        <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 p-6 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold text-slate-700 dark:text-white/80">{t('admin.questionImport.uploadTitle')}</h2>

          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 dark:border-white/15 p-10 text-center transition-colors hover:border-amber-400 dark:hover:border-amber-500"
          >
            {/* Excel icon */}
            <svg className="mb-3 h-10 w-10 text-emerald-500/70" viewBox="0 0 48 48" fill="none">
              <rect x="6" y="4" width="36" height="40" rx="3" fill="#1D6F42" opacity="0.15"/>
              <rect x="6" y="4" width="36" height="40" rx="3" stroke="#1D6F42" strokeWidth="2" opacity="0.5"/>
              <text x="24" y="29" textAnchor="middle" fontSize="18" fontWeight="bold" fill="#1D6F42" opacity="0.7">X</text>
            </svg>
            {fileName
              ? <p className="text-sm font-medium text-slate-800 dark:text-white">{fileName}</p>
              : <p className="text-sm text-slate-500 dark:text-white/40">{t('admin.questionImport.dropText')}</p>
            }
            <p className="mt-1 text-xs text-slate-400 dark:text-white/25">.xlsx · .xls</p>
            <input ref={inputRef} type="file" accept=".xlsx,.xls" onChange={handleChange} className="hidden" />
            <Button
              label={t('admin.questionImport.browseButton')}
              variant="secondary"
              className="mt-3"
              type="button"
              onClick={() => inputRef.current?.click()}
            />
          </div>

          {/* Result */}
          {result && (
            <div className="mt-4 space-y-2">
              {/* Imported */}
              {result.imported > 0 && (
                <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 dark:border-emerald-500/20 dark:bg-emerald-500/10 px-4 py-2.5 text-sm">
                  <CheckIcon className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" strokeWidth={3} />
                  <span className="font-semibold text-emerald-700 dark:text-emerald-300">
                    {t('admin.questionImport.resultImported', { count: result.imported })}
                  </span>
                </div>
              )}
              {/* Duplicates */}
              {result.duplicates > 0 && (
                <div className="flex items-center gap-2 rounded-lg border border-sky-200 bg-sky-50 dark:border-sky-500/20 dark:bg-sky-500/10 px-4 py-2.5 text-sm">
                  <span className="text-sky-500 dark:text-sky-400 text-lg leading-none">⊘</span>
                  <span className="font-semibold text-sky-700 dark:text-sky-300">
                    {t('admin.questionImport.resultDuplicates', { count: result.duplicates })}
                  </span>
                </div>
              )}
              {/* Validation errors */}
              {result.skipped > 0 && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-500/20 dark:bg-amber-500/10 px-4 py-2.5 text-sm">
                  <p className="font-semibold text-amber-700 dark:text-amber-300">
                    {t('admin.questionImport.resultSkipped', { count: result.skipped })}
                  </p>
                  <ul className="mt-1.5 space-y-0.5 text-xs text-amber-600 dark:text-amber-400">
                    {result.errors.map((e, i) => <li key={i}>• {e}</li>)}
                  </ul>
                </div>
              )}
              {/* All clean */}
              {result.imported === 0 && result.duplicates === 0 && result.skipped === 0 && (
                <p className="text-sm text-slate-400 dark:text-white/30">{t('common.noData')}</p>
              )}
            </div>
          )}
          {error && (
            <p className="mt-4 rounded-lg border border-rose-200 bg-rose-50 dark:border-rose-500/20 dark:bg-rose-500/10 px-4 py-3 text-sm text-rose-600 dark:text-rose-400">{error}</p>
          )}

          {fileName && !result && (
            <div className="mt-4 flex justify-end gap-3">
              <Button label={t('common.cancel')} variant="secondary" type="button" onClick={reset} />
              <Button
                label={isUploading ? t('common.saving') : t('admin.questionImport.uploadButton')}
                disabled={isUploading}
                onClick={handleUpload}
              />
            </div>
          )}
        </div>

        {/* ── Format documentation ── */}
        <div className="space-y-4">
          {/* Column reference */}
          <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 p-5 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-700 dark:text-white/80">{t('admin.questionImport.formatTitle')}</h2>
              <button
                onClick={downloadSample}
                className="flex items-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 px-3 py-1.5 text-xs font-semibold text-white transition-colors shadow-sm"
              >
                <DownloadIcon className="h-3.5 w-3.5" />
                {t('admin.questionImport.downloadTemplate')}
              </button>
            </div>
            <p className="mb-3 text-xs text-slate-500 dark:text-white/40">{t('admin.questionImport.formatDesc')}</p>

            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-white/10">
                    <th className="pb-1.5 text-left font-semibold text-slate-500 dark:text-white/40">{t('admin.questionImport.colField')}</th>
                    <th className="pb-1.5 text-center font-semibold text-slate-500 dark:text-white/40">{t('admin.questionImport.colRequired')}</th>
                    <th className="pb-1.5 text-left font-semibold text-slate-500 dark:text-white/40">{t('admin.questionImport.colNotes')}</th>
                  </tr>
                </thead>
                <tbody>
                  {COLUMNS.map(({ field, required }) => (
                    <tr key={field} className="border-b border-slate-50 dark:border-white/5">
                      <td className="py-1.5 font-mono text-amber-600 dark:text-amber-400">{field}</td>
                      <td className="py-1.5 text-center text-slate-500 dark:text-white/50">
                        {required ? (
                          <CheckIcon className="mx-auto h-4 w-4 text-emerald-500" strokeWidth={3} />
                        ) : ''}
                      </td>
                      <td className="py-1.5 text-slate-600 dark:text-white/55">
                        {t(`admin.questionImport.field_${field.replace('–', '_').replace('1', '').replace('4', '')}`)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Category reference */}
          <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 p-5 shadow-sm">
            <h2 className="mb-3 text-sm font-semibold text-slate-700 dark:text-white/80">{t('admin.questionImport.categoryRef')}</h2>
            <div className="grid grid-cols-2 gap-3 text-xs text-slate-600 dark:text-white/55">
              <div>
                <p className="mb-1 font-semibold text-slate-400 dark:text-white/35">IT</p>
                {['AWS', 'Network', 'Security', 'Linux'].map((c) => (
                  <p key={c} className="font-mono text-amber-600 dark:text-amber-400">{c}</p>
                ))}
              </div>
              <div>
                <p className="mb-1 font-semibold text-slate-400 dark:text-white/35">JLPT</p>
                {['JLPT-N5-文字語彙', 'JLPT-N5-文法読解', '…N4, N3, N2, N1…'].map((c) => (
                  <p key={c} className="font-mono text-amber-600 dark:text-amber-400">{c}</p>
                ))}
              </div>
            </div>
          </div>

          {/* Difficulty & correct_index note */}
          <div className="rounded-xl border border-amber-200 dark:border-amber-500/20 bg-amber-50 dark:bg-amber-500/8 p-4 text-xs text-amber-700 dark:text-amber-300">
            <p className="font-semibold mb-1">{t('admin.questionImport.tipsTitle')}</p>
            <ul className="space-y-0.5 list-disc list-inside">
              <li>{t('admin.questionImport.tip1')}</li>
              <li>{t('admin.questionImport.tip2')}</li>
              <li>{t('admin.questionImport.tip3')}</li>
            </ul>
          </div>
        </div>
      </div>
    </PageShell>
  );
};

export default QuestionImport;
