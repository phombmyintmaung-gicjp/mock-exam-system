import { clsx } from 'clsx';
import useLanguage from '@/hooks/useLanguage';

interface LanguageToggleProps {
  variant?: 'light' | 'dark';
}

const LanguageToggle = ({ variant = 'light' }: LanguageToggleProps) => {
  const { currentLanguage, toggleLanguage } = useLanguage();
  const isDark = variant === 'dark';

  return (
    <div
      className={clsx(
        'flex rounded-lg p-0.5',
        isDark
          ? 'border border-white/20 bg-white/10'
          : 'border border-gray-200 bg-gray-50',
      )}
    >
      <button
        onClick={() => currentLanguage !== 'ja' && toggleLanguage()}
        className={clsx(
          'rounded-md px-3 py-1 text-sm font-medium transition-colors',
          currentLanguage === 'ja'
            ? isDark
              ? 'bg-indigo-600 text-white'
              : 'bg-indigo-600 text-white'
            : isDark
            ? 'text-white/60 hover:text-white'
            : 'text-gray-600 hover:text-gray-900',
        )}
      >
        日本語
      </button>
      <button
        onClick={() => currentLanguage !== 'en' && toggleLanguage()}
        className={clsx(
          'rounded-md px-3 py-1 text-sm font-medium transition-colors',
          currentLanguage === 'en'
            ? isDark
              ? 'bg-indigo-600 text-white'
              : 'bg-indigo-600 text-white'
            : isDark
            ? 'text-white/60 hover:text-white'
            : 'text-gray-600 hover:text-gray-900',
        )}
      >
        English
      </button>
    </div>
  );
};

export { LanguageToggle };
