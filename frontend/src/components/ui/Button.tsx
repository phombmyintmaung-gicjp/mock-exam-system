import type { ReactNode } from 'react';
import { clsx } from 'clsx';

type ButtonVariant = 'primary' | 'secondary' | 'danger';

interface ButtonProps {
  label: string;
  variant?: ButtonVariant;
  disabled?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/25 hover:from-amber-400 hover:to-orange-400 hover:shadow-amber-500/40 focus-visible:ring-amber-400',
  secondary:
    'border border-slate-200 bg-white text-slate-700 backdrop-blur-sm hover:bg-slate-50 hover:border-slate-300 focus-visible:outline-amber-500 dark:border-white/20 dark:bg-white/10 dark:text-white dark:hover:bg-white/20 dark:hover:border-white/30',
  danger:
    'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-lg shadow-rose-500/25 hover:from-rose-400 hover:to-pink-400 focus-visible:ring-rose-400',
};

const Button = ({
  label,
  variant = 'primary',
  disabled = false,
  onClick,
  type = 'button',
  className,
  leftIcon,
  rightIcon,
}: ButtonProps) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        'inline-flex items-center justify-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent',
        variantClasses[variant],
        disabled && 'cursor-not-allowed opacity-50',
        className,
      )}
    >
      {leftIcon}
      {label}
      {rightIcon}
    </button>
  );
};

export { Button };
