import { clsx } from 'clsx';

type BadgeVariant = 'pass' | 'fail' | 'easy' | 'medium' | 'hard' | 'neutral';

interface BadgeProps {
  label: string;
  variant: BadgeVariant;
}

const variantClasses: Record<BadgeVariant, string> = {
  pass: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-sm shadow-emerald-500/10',
  fail: 'bg-rose-500/20 text-rose-300 border border-rose-500/30 shadow-sm shadow-rose-500/10',
  easy: 'bg-sky-500/20 text-sky-300 border border-sky-500/30 shadow-sm shadow-sky-500/10',
  medium: 'bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-sm shadow-amber-500/10',
  hard:    'bg-red-500/20 text-red-300 border border-red-500/30 shadow-sm shadow-red-500/10',
  neutral: 'bg-slate-500/20 text-slate-400 border border-slate-500/30 shadow-sm shadow-slate-500/10',
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
