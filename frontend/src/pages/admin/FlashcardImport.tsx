import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { PageShell } from '@/components/layout/PageShell';
import { Button } from '@/components/ui/Button';
import { Furigana } from '@/components/shared/Furigana';
import { importFlashcards } from '@/services/flashcardService';
import type { FlashcardImportResult } from '@/services/flashcardService';
import { CheckIcon, DownloadIcon } from '@/components/ui/Icons';

// ── Sample template download ──────────────────────────────────────────────────

const SAMPLE_ROWS = [
  ['type', 'level', 'front', 'reading', 'meaning', 'meaning_my', 'example_sentence', 'example_translation'],
  ['kanji',   'N5', '日',    'にち・ひ', 'day, sun',       'နေ့、နေရောင်',  '{今日|きょう}はいい{日|ひ}ですね。',           'Today is a nice day, isn\'t it?'],
  ['vocab',   'N4', '便利',  'べんり',   'convenient',     'အဆင်ပြေသော',  'スマホはとても{便利|べんり}です。',             'Smartphones are very convenient.'],
  ['grammar', 'N3', '～によって', '',    'depending on ~', '~ပေါ်မူတည်၍', '{人|ひと}によって{意見|いけん}が{違|ちが}います。', 'Opinions differ depending on the person.'],
  ['kanji',   'N2', '維',    'い',       'maintain, fiber', '',              '{現状|げんじょう}を{維持|いじ}することが{難|むずか}しい。', 'It is difficult to maintain the current situation.'],
  ['vocab',   'N1', '貢献',  'こうけん', 'contribution',   '',              '{社会|しゃかい}に{貢献|こうけん}したいです。',   'I want to contribute to society.'],
];

const downloadTemplate = () => {
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(SAMPLE_ROWS);
  ws['!cols'] = [
    { wch: 10 }, // type
    { wch:  6 }, // level
    { wch: 20 }, // front
    { wch: 16 }, // reading
    { wch: 24 }, // meaning
    { wch: 24 }, // meaning_my
    { wch: 48 }, // example_sentence
    { wch: 48 }, // example_translation
  ];
  XLSX.utils.book_append_sheet(wb, ws, 'Flashcards');
  XLSX.writeFile(wb, 'flashcards_template.xlsx');
};

// ── Column reference ──────────────────────────────────────────────────────────

const COLUMNS = [
  { field: 'type',                 required: true  },
  { field: 'level',                required: true  },
  { field: 'front',                required: true  },
  { field: 'reading',              required: false },
  { field: 'meaning',              required: true  },
  { field: 'meaning_my',           required: false },
  { field: 'example_sentence',     required: false },
  { field: 'example_translation',  required: false },
] as const;

// ── Component ─────────────────────────────────────────────────────────────────

const FURIGANA_DEMO = '{今日|きょう}は{良|よ}い{天気|てんき}ですね。';

const FlashcardImport = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  const [fileName,    setFileName]    = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [result,      setResult]      = useState<FlashcardImportResult | null>(null);
  const [error,       setError]       = useState<string | null>(null);

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
      const res = await importFlashcards(file);
      setResult(res);
      if (res.imported > 0 && res.skipped === 0) {
        setTimeout(() => navigate('/admin/flashcards'), 1800);
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
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          {t('admin.flashcards.importTitle')}
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-white/50">
          {t('admin.flashcards.importSubtitle')}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">

        {/* ── Upload panel ── */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
          <h2 className="mb-4 text-sm font-semibold text-slate-700 dark:text-white/80">
            {t('admin.flashcards.uploadTitle')}
          </h2>

          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 p-10 text-center transition-colors hover:border-amber-400 dark:border-white/15 dark:hover:border-amber-500"
          >
            {/* Flashcard icon */}
            <svg className="mb-3 h-10 w-10 text-amber-400/80" viewBox="0 0 48 48" fill="none">
              <rect x="4" y="10" width="40" height="28" rx="4" fill="currentColor" opacity="0.15" />
              <rect x="4" y="10" width="40" height="28" rx="4" stroke="currentColor" strokeWidth="2" opacity="0.6" />
              <rect x="8" y="6" width="40" height="28" rx="4" fill="currentColor" opacity="0.08" stroke="currentColor" strokeWidth="1.5" />
              <text x="24" y="30" textAnchor="middle" fontSize="16" fontWeight="bold" fill="currentColor" opacity="0.7">あ</text>
            </svg>

            {fileName
              ? <p className="text-sm font-medium text-slate-800 dark:text-white">{fileName}</p>
              : <p className="text-sm text-slate-500 dark:text-white/40">{t('admin.flashcards.dropText')}</p>
            }
            <p className="mt-1 text-xs text-slate-400 dark:text-white/25">.xlsx · .xls</p>
            <input ref={inputRef} type="file" accept=".xlsx,.xls" onChange={handleChange} className="hidden" />
            <Button
              label={t('admin.flashcards.browseButton')}
              variant="secondary"
              className="mt-3"
              type="button"
              onClick={() => inputRef.current?.click()}
            />
          </div>

          {/* Result summary */}
          {result && (
            <div className="mt-4 space-y-2">
              {result.imported > 0 && (
                <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm dark:border-emerald-500/20 dark:bg-emerald-500/10">
                  <CheckIcon className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" strokeWidth={3} />
                  <span className="font-semibold text-emerald-700 dark:text-emerald-300">
                    {t('admin.flashcards.resultImported', { count: result.imported })}
                  </span>
                </div>
              )}
              {result.duplicates > 0 && (
                <div className="flex items-center gap-2 rounded-lg border border-sky-200 bg-sky-50 px-4 py-2.5 text-sm dark:border-sky-500/20 dark:bg-sky-500/10">
                  <span className="text-lg leading-none text-sky-500 dark:text-sky-400">⊘</span>
                  <span className="font-semibold text-sky-700 dark:text-sky-300">
                    {t('admin.flashcards.resultDuplicates', { count: result.duplicates })}
                  </span>
                </div>
              )}
              {result.skipped > 0 && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm dark:border-amber-500/20 dark:bg-amber-500/10">
                  <p className="font-semibold text-amber-700 dark:text-amber-300">
                    {t('admin.flashcards.resultSkipped', { count: result.skipped })}
                  </p>
                  <ul className="mt-1.5 space-y-0.5 text-xs text-amber-600 dark:text-amber-400">
                    {result.errors.map((e, i) => <li key={i}>• {e}</li>)}
                  </ul>
                </div>
              )}
              {result.imported === 0 && result.duplicates === 0 && result.skipped === 0 && (
                <p className="text-sm text-slate-400 dark:text-white/30">{t('common.noData')}</p>
              )}
            </div>
          )}

          {error && (
            <p className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-400">
              {error}
            </p>
          )}

          {fileName && !result && (
            <div className="mt-4 flex justify-end gap-3">
              <Button label={t('common.cancel')} variant="secondary" type="button" onClick={reset} />
              <Button
                label={isUploading ? t('common.saving') : t('admin.flashcards.uploadButton')}
                disabled={isUploading}
                onClick={handleUpload}
              />
            </div>
          )}
        </div>

        {/* ── Guide panel ── */}
        <div className="space-y-4">

          {/* Column reference */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-700 dark:text-white/80">
                {t('admin.flashcards.formatTitle')}
              </h2>
              <button
                onClick={downloadTemplate}
                className="flex items-center gap-1.5 rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-amber-600"
              >
                <DownloadIcon className="h-3.5 w-3.5" />
                {t('admin.flashcards.downloadTemplate')}
              </button>
            </div>
            <p className="mb-3 text-xs text-slate-500 dark:text-white/40">
              {t('admin.flashcards.formatDesc')}
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-white/10">
                    <th className="pb-1.5 text-left font-semibold text-slate-500 dark:text-white/40">{t('admin.flashcards.colField')}</th>
                    <th className="pb-1.5 text-center font-semibold text-slate-500 dark:text-white/40 whitespace-nowrap">{t('admin.flashcards.colRequired')}</th>
                    <th className="pb-1.5 text-left font-semibold text-slate-500 dark:text-white/40">{t('admin.flashcards.colNotes')}</th>
                  </tr>
                </thead>
                <tbody>
                  {COLUMNS.map(({ field, required }) => (
                    <tr key={field} className="border-b border-slate-50 dark:border-white/5">
                      <td className="py-1.5 font-mono text-amber-600 dark:text-amber-400">{field}</td>
                      <td className="py-1.5 text-center">
                        {required
                          ? <CheckIcon className="mx-auto h-4 w-4 text-emerald-500" strokeWidth={3} />
                          : <span className="text-slate-300 dark:text-white/20">—</span>
                        }
                      </td>
                      <td className="py-1.5 text-slate-600 dark:text-white/55">
                        {t(`admin.flashcards.field_${field}`)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Furigana notation guide */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/5">
            <h2 className="mb-2 text-sm font-semibold text-slate-700 dark:text-white/80">
              {t('admin.flashcards.furiganaTitle')}
            </h2>
            <p className="mb-3 text-xs text-slate-500 dark:text-white/40">
              {t('admin.flashcards.furiganaDesc')}
            </p>

            {/* Notation diagram */}
            <div className="mb-3 flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 dark:bg-white/5">
              <span className="shrink-0 rounded bg-amber-100 px-1.5 py-0.5 font-mono text-xs font-semibold text-amber-700 dark:bg-amber-400/15 dark:text-amber-300">
                {'{漢字|よみ}'}
              </span>
              <svg className="h-3 w-3 shrink-0 text-slate-300 dark:text-white/20" viewBox="0 0 16 16" fill="currentColor">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <ruby className="text-sm text-slate-800 dark:text-white">
                漢字<rt className="text-[0.6em] text-amber-600 dark:text-amber-400">よみ</rt>
              </ruby>
            </div>

            <p className="mb-1.5 text-xs font-medium text-slate-500 dark:text-white/40">
              {t('admin.flashcards.furiganaExample')}
            </p>

            {/* Raw input */}
            <div className="rounded-t-lg border border-b-0 border-slate-200 bg-slate-50 px-3 py-2 dark:border-white/10 dark:bg-white/3">
              <p className="font-mono text-xs text-slate-500 dark:text-white/40">{FURIGANA_DEMO}</p>
            </div>
            {/* Rendered output */}
            <div className="rounded-b-lg border border-slate-200 bg-white px-3 py-2 dark:border-white/10 dark:bg-white/5">
              <p className="text-sm leading-loose text-slate-800 dark:text-white">
                <Furigana text={FURIGANA_DEMO} />
              </p>
            </div>
          </div>

          {/* Tips */}
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/8 dark:text-amber-300">
            <p className="mb-1 font-semibold">{t('admin.flashcards.tipsTitle')}</p>
            <ul className="list-inside list-disc space-y-0.5">
              <li>{t('admin.flashcards.tip1')}</li>
              <li>{t('admin.flashcards.tip2')}</li>
              <li>{t('admin.flashcards.tip3')}</li>
            </ul>
          </div>
        </div>
      </div>
    </PageShell>
  );
};

export default FlashcardImport;
