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
        'flex items-center gap-2 rounded-xl border px-4 py-2 font-mono text-lg font-semibold tabular-nums shadow-sm',
        isWarning
          ? 'border-rose-300 bg-rose-50 text-rose-600 shadow-rose-100'
          : mode === 'elapsed'
            ? 'border-blue-200 bg-blue-50 text-blue-700'
            : 'border-slate-200 bg-white text-slate-800',
      )}
    >
      <svg
        className={clsx('h-5 w-5', isWarning ? 'text-rose-500' : mode === 'elapsed' ? 'text-blue-500' : 'text-indigo-500')}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      {formatTime(seconds)}
    </div>
  );
};

export { Timer };
