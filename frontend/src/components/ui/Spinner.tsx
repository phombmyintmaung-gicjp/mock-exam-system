import { clsx } from 'clsx';

type SpinnerSize = 'sm' | 'md' | 'lg';

interface SpinnerProps {
  size?: SpinnerSize;
}

const sizeClasses: Record<SpinnerSize, string> = {
  sm: 'h-4 w-4 border-2',
  md: 'h-8 w-8 border-4',
  lg: 'h-12 w-12 border-4',
};

const Spinner = ({ size = 'md' }: SpinnerProps) => {
  return (
    <div
      role="status"
      aria-label="loading"
      className={clsx(
        'animate-spin rounded-full border-gray-200 border-t-amber-500',
        sizeClasses[size],
      )}
    />
  );
};

export { Spinner };
