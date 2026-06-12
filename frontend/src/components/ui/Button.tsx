import { clsx } from 'clsx';

type ButtonVariant = 'primary' | 'secondary' | 'danger';

interface ButtonProps {
  label: string;
  variant?: ButtonVariant;
  disabled?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-sm hover:from-indigo-700 hover:to-violet-700 hover:shadow-md focus-visible:ring-indigo-500',
  secondary:
    'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-400 focus-visible:ring-slate-400',
  danger:
    'bg-gradient-to-r from-rose-600 to-red-600 text-white shadow-sm hover:from-rose-700 hover:to-red-700 focus-visible:ring-rose-500',
};

const Button = ({
  label,
  variant = 'primary',
  disabled = false,
  onClick,
  type = 'button',
  className,
}: ButtonProps) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        'inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
        variantClasses[variant],
        disabled && 'cursor-not-allowed opacity-50',
        className,
      )}
    >
      {label}
    </button>
  );
};

export { Button };
