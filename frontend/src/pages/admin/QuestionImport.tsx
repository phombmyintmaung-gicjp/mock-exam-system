import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { PageShell } from '@/components/layout/PageShell';
import { Button } from '@/components/ui/Button';
import { importQuestions } from '@/services/questionService';

const QuestionImport = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleFile = (file: File) => {
    setFileName(file.name);
    setMessage(null);
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
    setMessage(null);
    try {
      await importQuestions(file);
      setMessage({ type: 'success', text: t('admin.questionImport.success') });
      setTimeout(() => navigate('/admin/questions'), 1500);
    } catch {
      setMessage({ type: 'error', text: t('common.error') });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <PageShell>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{t('admin.questionImport.title')}</h1>
        <p className="mt-1 text-sm text-gray-500">{t('admin.questionImport.subtitle')}</p>
      </div>

      <div className="max-w-xl rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
        {message && (
          <p className={`mb-4 rounded-lg px-4 py-3 text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
            {message.text}
          </p>
        )}

        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-12 text-center transition-colors hover:border-blue-400"
        >
          <svg className="mb-4 h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
          </svg>
          {fileName
            ? <p className="text-sm font-medium text-gray-800">{fileName}</p>
            : <p className="text-sm font-medium text-gray-700">{t('admin.questionImport.dropText')}</p>
          }
          <p className="mt-1 text-xs text-gray-400">{t('common.or')}</p>
          <input
            ref={inputRef}
            type="file"
            accept=".csv,.json,.txt"
            onChange={handleChange}
            className="hidden"
          />
          <Button
            label={t('admin.questionImport.browseButton')}
            variant="secondary"
            className="mt-3"
            type="button"
            onClick={() => inputRef.current?.click()}
          />
        </div>

        {fileName && (
          <div className="mt-4 flex justify-end gap-3">
            <Button
              label={t('common.cancel')}
              variant="secondary"
              type="button"
              onClick={() => { setFileName(null); if (inputRef.current) inputRef.current.value = ''; }}
            />
            <Button
              label={isUploading ? t('common.saving') : t('admin.questionImport.uploadButton')}
              disabled={isUploading}
              onClick={handleUpload}
            />
          </div>
        )}
      </div>
    </PageShell>
  );
};

export default QuestionImport;
