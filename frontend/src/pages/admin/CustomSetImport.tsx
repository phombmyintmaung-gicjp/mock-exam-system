import { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import * as XLSX from 'xlsx';
import { PageShell } from '@/components/layout/PageShell';
import { Button } from '@/components/ui/Button';
import { CheckIcon, ChevronLeftIcon, DownloadIcon } from '@/components/ui/Icons';
import { importCustomSetFromExcel } from '@/services/customSetService';
import type { CustomSetImportResult } from '@/types/customSet';
import { APP_BASE_PATH } from '@/constants';

// ── Sample template download ──────────────────────────────────────────────────

const downloadTemplate = () => {
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet([
    ['text', 'explanation', 'choice1', 'choice2', 'choice3', 'choice4', 'correct_index'],
    [
      'What does HTML stand for?',
      'HTML stands for HyperText Markup Language.',
      'HyperText Markup Language',
      'HighText Machine Language',
      'HyperText and links Markup Language',
      'HyperText Media Language',
      1,
    ],
    [
      'Which protocol is used for secure web browsing?',
      'HTTPS uses SSL/TLS encryption for data security.',
      'HTTP',
      'HTTPS',
      'FTP',
      'SMTP',
      2,
    ],
  ]);
  ws['!cols'] = [
    { wch: 50 }, // text
    { wch: 40 }, // explanation
    { wch: 30 }, { wch: 30 }, { wch: 30 }, { wch: 30 }, // choices
    { wch: 14 }, // correct_index
  ];
  XLSX.utils.book_append_sheet(wb, ws, 'Questions');
  XLSX.writeFile(wb, 'custom_set_template.xlsx');
};

// ── Column definitions ────────────────────────────────────────────────────────

const COLUMNS = [
  { field: 'text',          required: true  },
  { field: 'choice1–4',     required: true  },
  { field: 'correct_index', required: true  },
  { field: 'explanation',   required: false },
] as const;

// ── Component ─────────────────────────────────────────────────────────────────

const CustomSetImport = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  const [name, setName]                     = useState('');
  const [slug, setSlug]                     = useState('');
  const [description, setDescription]       = useState('');
  const [timeLimitMinutes, setTimeLimit]    = useState('30');
  const [passingScore, setPassingScore]     = useState('70');
  const [isActive, setIsActive]             = useState(true);
  const [fileName, setFileName]             = useState<string | null>(null);
  const [isUploading, setIsUploading]       = useState(false);
  const [result, setResult]                 = useState<CustomSetImportResult | null>(null);
  const [error, setError]                   = useState<string | null>(null);
  const [copiedLink, setCopiedLink]         = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const file = inputRef.current?.files?.[0];
    if (!file || !name.trim()) return;

    setIsUploading(true);
    setResult(null);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', name.trim());
    if (slug.trim()) formData.append('slug', slug.trim());
    formData.append('description', description.trim());
    formData.append('time_limit_minutes', timeLimitMinutes);
    formData.append('passing_score', passingScore);
    formData.append('is_active', isActive ? '1' : '0');

    try {
      const res = await importCustomSetFromExcel(formData);
      setResult(res);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string; message?: string } } })
        ?.response?.data?.error
        ?? (err as { response?: { data?: { message?: string } } })?.response?.data?.message
        ?? t('common.error');
      setError(msg);
    } finally {
      setIsUploading(false);
    }
  };

  const copyLink = (slug: string) => {
    const url = `${window.location.origin}${APP_BASE_PATH}/exam/custom/${slug}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(() => {
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
      });
    } else {
      const el = document.createElement('textarea');
      el.value = url;
      el.style.cssText = 'position:fixed;opacity:0';
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <PageShell>
      <div className="mb-6">
        <Link
          to="/admin/custom-sets"
          className="mb-3 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 dark:text-white/40 dark:hover:text-white/70"
        >
          <ChevronLeftIcon className="h-3.5 w-3.5" />
          {t('admin.customSets.backToList')}
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('admin.customSets.import.title')}</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-white/50">{t('admin.customSets.import.subtitle')}</p>
      </div>

      {/* Success result */}
      {result && (
        <div className="mb-6 space-y-4">
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 dark:border-emerald-500/20 dark:bg-emerald-500/10 p-5">
            <div className="mb-3 flex items-center gap-2">
              <CheckIcon className="h-5 w-5 text-emerald-600 dark:text-emerald-400" strokeWidth={3} />
              <p className="font-semibold text-emerald-700 dark:text-emerald-300">
                {t('admin.customSets.import.success', { name: result.set.name, count: result.imported })}
              </p>
            </div>
            <div className="mb-4 flex flex-wrap gap-3 text-xs">
              <span className="rounded-full bg-emerald-100 dark:bg-emerald-500/20 px-3 py-1 font-semibold text-emerald-700 dark:text-emerald-300">
                {t('admin.customSets.import.resultImported', { count: result.imported })}
              </span>
              {result.skipped > 0 && (
                <span className="rounded-full bg-amber-100 dark:bg-amber-500/20 px-3 py-1 font-semibold text-amber-700 dark:text-amber-300">
                  {t('admin.customSets.import.resultSkipped', { count: result.skipped })}
                </span>
              )}
            </div>

            {/* Share link */}
            <div className="mb-4 rounded-lg border border-emerald-200 dark:border-emerald-500/30 bg-white dark:bg-white/5 px-4 py-3">
              <p className="mb-1 text-xs font-semibold text-gray-500 dark:text-white/40 uppercase tracking-wide">
                {t('admin.customSets.shareLink')}
              </p>
              <div className="flex items-center gap-3">
                <code className="flex-1 truncate text-sm font-mono text-amber-600 dark:text-amber-400">
                  {`${window.location.origin}${APP_BASE_PATH}/exam/custom/${result.set.slug}`}
                </code>
                <button
                  onClick={() => copyLink(result.set.slug)}
                  className="shrink-0 text-xs font-medium text-amber-600 hover:text-amber-700 dark:text-amber-400"
                >
                  {copiedLink ? t('admin.customSets.linkCopied') : t('admin.customSets.copyLink')}
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                label={t('admin.customSets.import.editSet')}
                onClick={() => navigate(`/admin/custom-sets/${result.set.id}/edit`)}
              />
              <Button
                label={t('admin.customSets.import.createAnother')}
                variant="secondary"
                onClick={() => { setResult(null); setFileName(null); setName(''); setSlug(''); setDescription(''); if (inputRef.current) inputRef.current.value = ''; }}
              />
            </div>
          </div>

          {result.errors.length > 0 && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 dark:border-amber-500/20 dark:bg-amber-500/10 px-5 py-4">
              <p className="mb-2 font-semibold text-amber-700 dark:text-amber-300 text-sm">
                {t('admin.customSets.import.errorTitle', { count: result.errors.length })}
              </p>
              <ul className="space-y-0.5 text-xs text-amber-600 dark:text-amber-400">
                {result.errors.map((e, i) => <li key={i}>• {e}</li>)}
              </ul>
            </div>
          )}
        </div>
      )}

      {!result && (
        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 lg:grid-cols-2">
            {/* ── Left: metadata + upload ── */}
            <div className="space-y-5">
              {/* Metadata */}
              <div className="rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 p-5 shadow-sm">
                <h2 className="mb-4 text-sm font-semibold text-gray-700 dark:text-white/80">{t('admin.customSets.metadataSection')}</h2>
                <div className="space-y-4">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-white/60">{t('admin.customSets.name')} *</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={t('admin.customSets.namePlaceholder')}
                      required
                      className="glass-input w-full rounded-xl px-4 py-2.5 text-sm"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-white/60">
                      {t('admin.customSets.import.slugLabel')}
                      <span className="ml-1 font-normal opacity-60">{t('admin.customSets.import.slugHint')}</span>
                    </label>
                    <input
                      type="text"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value.replace(/[^a-zA-Z0-9_-]/g, ''))}
                      placeholder={t('admin.customSets.import.slugPlaceholder')}
                      className="glass-input w-full rounded-xl px-4 py-2.5 text-sm font-mono"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-white/60">{t('admin.customSets.description')}</label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder={t('admin.customSets.descriptionPlaceholder')}
                      rows={2}
                      className="glass-input w-full rounded-xl px-4 py-2.5 text-sm resize-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-white/60">{t('admin.customSets.timeLimitMinutes')}</label>
                      <input
                        type="number"
                        min="0"
                        max="300"
                        value={timeLimitMinutes}
                        onChange={(e) => setTimeLimit(e.target.value)}
                        className="glass-input w-full rounded-xl px-4 py-2.5 text-sm"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-white/60">{t('admin.customSets.passingScore')}</label>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={passingScore}
                        onChange={(e) => setPassingScore(e.target.value)}
                        className="glass-input w-full rounded-xl px-4 py-2.5 text-sm"
                      />
                    </div>
                  </div>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-amber-500 focus:ring-amber-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-white/80">{t('admin.customSets.isActive')}</span>
                  </label>
                </div>
              </div>

              {/* File upload */}
              <div className="rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 p-5 shadow-sm">
                <h2 className="mb-4 text-sm font-semibold text-gray-700 dark:text-white/80">{t('admin.customSets.import.uploadTitle')}</h2>
                <div
                  onDrop={handleDrop}
                  onDragOver={(e) => e.preventDefault()}
                  className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 dark:border-white/15 p-8 text-center transition-colors hover:border-amber-400 dark:hover:border-amber-500"
                >
                  <svg className="mb-3 h-10 w-10 text-emerald-500/70" viewBox="0 0 48 48" fill="none">
                    <rect x="6" y="4" width="36" height="40" rx="3" fill="#1D6F42" opacity="0.15"/>
                    <rect x="6" y="4" width="36" height="40" rx="3" stroke="#1D6F42" strokeWidth="2" opacity="0.5"/>
                    <text x="24" y="29" textAnchor="middle" fontSize="18" fontWeight="bold" fill="#1D6F42" opacity="0.7">X</text>
                  </svg>
                  {fileName
                    ? <p className="text-sm font-medium text-gray-800 dark:text-white">{fileName}</p>
                    : <p className="text-sm text-gray-500 dark:text-white/40">{t('admin.customSets.import.dropText')}</p>
                  }
                  <p className="mt-1 text-xs text-gray-400 dark:text-white/25">.xlsx · .xls</p>
                  <input ref={inputRef} type="file" accept=".xlsx,.xls" onChange={handleChange} className="hidden" />
                  <Button
                    label={t('admin.customSets.import.browseButton')}
                    variant="secondary"
                    className="mt-3"
                    type="button"
                    onClick={() => inputRef.current?.click()}
                  />
                </div>

                {error && (
                  <p className="mt-4 rounded-lg border border-rose-200 bg-rose-50 dark:border-rose-500/20 dark:bg-rose-500/10 px-4 py-3 text-sm text-rose-600 dark:text-rose-400">
                    {error}
                  </p>
                )}

                <div className="mt-4 flex justify-end gap-3">
                  <Button
                    label={isUploading ? t('common.saving') : t('admin.customSets.import.importButton')}
                    type="submit"
                    disabled={isUploading || !fileName || !name.trim()}
                  />
                </div>
              </div>
            </div>

            {/* ── Right: format guide ── */}
            <div className="space-y-4">
              <div className="rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 p-5 shadow-sm">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-gray-700 dark:text-white/80">{t('admin.customSets.import.formatTitle')}</h2>
                  <button
                    type="button"
                    onClick={downloadTemplate}
                    className="flex items-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 px-3 py-1.5 text-xs font-semibold text-white transition-colors"
                  >
                    <DownloadIcon className="h-3.5 w-3.5" />
                    {t('admin.customSets.import.downloadTemplate')}
                  </button>
                </div>
                <p className="mb-4 text-xs text-gray-500 dark:text-white/40">{t('admin.customSets.import.formatDesc')}</p>

                <div className="overflow-x-auto rounded-lg border border-gray-100 dark:border-white/8">
                  <table className="w-full text-xs">
                    <thead className="bg-gray-50 dark:bg-white/5">
                      <tr>
                        <th className="px-4 py-2 text-left font-semibold text-gray-500 dark:text-white/40">{t('admin.customSets.import.colHeader')}</th>
                        <th className="px-4 py-2 text-center font-semibold text-gray-500 dark:text-white/40">{t('admin.questionImport.colRequired')}</th>
                        <th className="px-4 py-2 text-left font-semibold text-gray-500 dark:text-white/40">{t('admin.questionImport.colNotes')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {COLUMNS.map((c) => (
                        <tr key={c.field} className="border-t border-gray-100 dark:border-white/5">
                          <td className="px-4 py-2 font-mono text-amber-600 dark:text-amber-400">{c.field}</td>
                          <td className="px-4 py-2 text-center">
                            {c.required
                              ? <CheckIcon className="mx-auto h-4 w-4 text-emerald-500" strokeWidth={3} />
                              : <span className="text-gray-400 dark:text-white/25">—</span>}
                          </td>
                          <td className="px-4 py-2 text-gray-600 dark:text-white/55">
                            {t(`admin.customSets.import.col_${c.field.replace('–', '_')}_notes`)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="rounded-xl border border-amber-200 dark:border-amber-500/20 bg-amber-50 dark:bg-amber-500/8 p-4 text-xs text-amber-700 dark:text-amber-300">
                <p className="mb-2 font-semibold">{t('admin.customSets.import.tipsTitle')}</p>
                <ul className="space-y-1 list-disc list-inside">
                  <li>{t('admin.customSets.import.tip1')}</li>
                  <li>{t('admin.customSets.import.tip2')}</li>
                  <li>{t('admin.customSets.import.tip3')}</li>
                </ul>
              </div>

              <div className="rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 p-5 shadow-sm">
                <p className="mb-2 text-xs font-semibold text-gray-500 dark:text-white/40 uppercase tracking-wide">
                  {t('admin.customSets.import.slugInfoTitle')}
                </p>
                <p className="text-xs text-gray-600 dark:text-white/55">{t('admin.customSets.import.slugInfoDesc')}</p>
                <div className="mt-3 rounded-lg bg-gray-50 dark:bg-white/5 px-3 py-2 font-mono text-xs text-amber-600 dark:text-amber-400">
                  {`${window.location.origin}${APP_BASE_PATH}/exam/custom/`}
                  <span className="text-gray-400 dark:text-white/30">{t('admin.customSets.import.slugInfoSuffix')}</span>
                </div>
              </div>
            </div>
          </div>
        </form>
      )}
    </PageShell>
  );
};

export default CustomSetImport;
