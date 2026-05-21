import { clsx } from 'clsx';

interface TimerProps {
  secondsRemaining: number;
}

const formatTime = (seconds: number): string => {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
};

const Timer = ({ secondsRemaining }: TimerProps) => {
  const isWarning = secondsRemaining <= 60;

  return (
    <div
      className={clsx(
        'flex items-center gap-2 rounded-lg border px-4 py-2 font-mono text-lg font-semibold tabular-nums',
        isWarning
          ? 'border-red-200 bg-red-50 text-red-600'
          : 'border-gray-200 bg-white text-gray-900',
      )}
    >
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      {formatTime(secondsRemaining)}
    </div>
  );
};

export { Timer };
