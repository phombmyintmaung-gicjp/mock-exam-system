import { clsx } from 'clsx';
import useLanguage from '@/hooks/useLanguage';

const LanguageToggle = () => {
  const { currentLanguage, toggleLanguage } = useLanguage();

  return (
    <div className="flex rounded-lg border border-gray-200 bg-gray-50 p-0.5">
      <button
        onClick={() => currentLanguage !== 'ja' && toggleLanguage()}
        className={clsx(
          'rounded-md px-3 py-1 text-sm font-medium transition-colors',
          currentLanguage === 'ja'
            ? 'bg-blue-600 text-white'
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
            ? 'bg-blue-600 text-white'
            : 'text-gray-600 hover:text-gray-900',
        )}
      >
        English
      </button>
    </div>
  );
};

export { LanguageToggle };
