import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';

interface ExamSecurityNoticeProps {
  onAcknowledge: () => void;
  onClose: () => void;
}

const ShieldIcon = () => (
  <svg className="h-10 w-10 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
  </svg>
);

const RuleIcon = () => (
  <svg className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
  </svg>
);

export function ExamSecurityNotice({ onAcknowledge, onClose }: ExamSecurityNoticeProps) {
  const { t } = useTranslation();
  const [agreed, setAgreed] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl border border-amber-200/50 bg-white shadow-2xl dark:border-amber-500/20 dark:bg-slate-900">
        <div className="relative flex flex-col items-center border-b border-slate-100 px-6 py-6 text-center dark:border-white/10">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:text-white/40 dark:hover:bg-white/10 dark:hover:text-white/70"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <ShieldIcon />
          <h2 className="mt-3 text-lg font-bold text-slate-800 dark:text-white">
            {t('examSecurity.notice.title')}
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-white/50">
            {t('examSecurity.notice.subtitle')}
          </p>
        </div>

        <ul className="space-y-3 px-6 py-5">
          {(['rule1', 'rule2', 'rule3', 'rule4'] as const).map((key) => (
            <li key={key} className="flex items-start gap-2.5 text-sm text-slate-700 dark:text-white/70">
              <RuleIcon />
              {t(`examSecurity.notice.${key}`)}
            </li>
          ))}
        </ul>

        <div className="border-t border-slate-100 px-6 pb-6 pt-4 dark:border-white/10 space-y-4">
          <label className="flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="h-4 w-4 cursor-pointer rounded border-slate-300 accent-amber-500 dark:border-white/30"
            />
            <span className="text-sm font-medium text-slate-700 dark:text-white/80">
              {t('examSecurity.notice.agree')}
            </span>
          </label>
          <Button
            label={t('examSecurity.notice.acknowledge')}
            onClick={onAcknowledge}
            disabled={!agreed}
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
}
