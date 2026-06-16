import { clsx } from 'clsx';
import useLanguage from '@/hooks/useLanguage';
import { useThemeStore } from '@/store/themeStore';

const LanguageToggle = () => {
  const { currentLanguage, toggleLanguage } = useLanguage();
  const theme = useThemeStore((s) => s.theme);
  const isDark = theme === 'dark';

  return (
    <div
      className={clsx(
        'flex rounded-lg p-0.5',
        isDark
          ? 'border border-white/20 bg-white/10'
          : 'border border-slate-200 bg-white/80',
      )}
    >
      <button
        onClick={() => currentLanguage !== 'ja' && toggleLanguage()}
        className={clsx(
          'rounded-md px-3 py-1 text-sm font-medium transition-colors',
          currentLanguage === 'ja'
            ? 'bg-amber-500 text-white'
            : isDark
            ? 'text-white/60 hover:text-white'
            : 'text-slate-500 hover:text-slate-900',
        )}
      >
        日本語
      </button>
      <button
        onClick={() => currentLanguage !== 'en' && toggleLanguage()}
        className={clsx(
          'rounded-md px-3 py-1 text-sm font-medium transition-colors',
          currentLanguage === 'en'
            ? 'bg-amber-500 text-white'
            : isDark
            ? 'text-white/60 hover:text-white'
            : 'text-slate-500 hover:text-slate-900',
        )}
      >
        English
      </button>
    </div>
  );
};

export { LanguageToggle };
