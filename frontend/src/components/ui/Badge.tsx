import { clsx } from 'clsx';

type BadgeVariant = 'pass' | 'fail' | 'easy' | 'medium' | 'hard';

interface BadgeProps {
  label: string;
  variant: BadgeVariant;
}

const variantClasses: Record<BadgeVariant, string> = {
  pass: 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/30',
  fail: 'bg-rose-500 text-white shadow-sm shadow-rose-500/30',
  easy: 'bg-sky-500 text-white shadow-sm shadow-sky-500/30',
  medium: 'bg-amber-500 text-white shadow-sm shadow-amber-500/30',
  hard: 'bg-red-600 text-white shadow-sm shadow-red-600/30',
};

const Badge = ({ label, variant }: BadgeProps) => {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold tracking-wide',
        variantClasses[variant],
      )}
    >
      {label}
    </span>
  );
};

export { Badge };
