import { useTranslation } from 'react-i18next';
import { clsx } from 'clsx';

interface SentenceArrangementProps {
  text: string;
}

export function SentenceArrangement({ text }: SentenceArrangementProps) {
  const { t } = useTranslation();

  const tokens = text.split(' ');
  let slotIdx = 0;

  return (
    <div className="space-y-3">
      <p className="text-xs italic text-slate-400 dark:text-white/40">
        {t('exam.mondai2Instruction')}
      </p>
      <div className="flex flex-wrap items-center gap-x-2 gap-y-2 text-base font-medium text-slate-800 dark:text-white/90 leading-relaxed">
        {tokens.map((token, i) => {
          if (token === '★' || token === '_') {
            const isStar = token === '★';
            slotIdx++;
            return (
              <span
                key={i}
                className={clsx(
                  'inline-flex h-9 min-w-[3rem] items-center justify-center rounded-lg border-2 px-2 text-sm font-bold transition-colors',
                  isStar
                    ? 'border-amber-400 bg-amber-400/20 text-amber-600 dark:border-amber-400/60 dark:bg-amber-400/15 dark:text-amber-300'
                    : 'border-slate-300 bg-slate-100/80 text-slate-400 dark:border-white/20 dark:bg-white/8 dark:text-white/30',
                )}
              >
                {isStar ? '★' : '＿'}
              </span>
            );
          }
          return <span key={i}>{token}</span>;
        })}
      </div>
    </div>
  );
}
