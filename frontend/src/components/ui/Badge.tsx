import { clsx } from 'clsx';

type BadgeVariant = 'pass' | 'fail' | 'easy' | 'medium' | 'hard';

interface BadgeProps {
  label: string;
  variant: BadgeVariant;
}

const variantClasses: Record<BadgeVariant, string> = {
  pass: 'bg-green-100 text-green-700 ring-green-600/20',
  fail: 'bg-red-100 text-red-700 ring-red-600/20',
  easy: 'bg-blue-100 text-blue-700 ring-blue-600/20',
  medium: 'bg-yellow-100 text-yellow-700 ring-yellow-600/20',
  hard: 'bg-red-100 text-red-700 ring-red-600/20',
};

const Badge = ({ label, variant }: BadgeProps) => {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset',
        variantClasses[variant],
      )}
    >
      {label}
    </span>
  );
};

export { Badge };
