import { clsx } from 'clsx';

interface TimerProps {
  seconds: number;
  mode?: 'countdown' | 'elapsed';
}

const formatTime = (seconds: number): string => {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
};

const Timer = ({ seconds, mode = 'countdown' }: TimerProps) => {
  const isWarning = mode === 'countdown' && seconds <= 60;

  return (
    <div
      className={clsx(
        'flex items-center gap-2 rounded-xl px-4 py-2 font-mono text-lg font-semibold tabular-nums backdrop-blur-md',
        isWarning
          ? 'border border-rose-400/40 bg-rose-500/20 text-rose-300 shadow-sm shadow-rose-500/10'
          : mode === 'elapsed'
            ? 'border border-amber-400/30 bg-amber-500/15 text-amber-700 dark:text-amber-300'
            : 'border border-slate-200 dark:border-white/15 bg-black/5 dark:bg-white/10 text-slate-800 dark:text-white/90',
      )}
    >
      <svg
        className={clsx('h-5 w-5', isWarning ? 'text-rose-400' : mode === 'elapsed' ? 'text-amber-500' : 'text-slate-500 dark:text-white/60')}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      {formatTime(seconds)}
    </div>
  );
};

export { Timer };
