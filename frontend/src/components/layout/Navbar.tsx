import { useTranslation } from 'react-i18next';
import { LanguageToggle } from '@/components/shared/LanguageToggle';
import { useThemeStore } from '@/store/themeStore';

interface NavbarProps {
  onMenuToggle: () => void;
  isMenuOpen: boolean;
}

const SunIcon = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const MoonIcon = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
  </svg>
);

const Navbar = ({ onMenuToggle, isMenuOpen }: NavbarProps) => {
  const { t } = useTranslation();
  const { theme, toggleTheme } = useThemeStore();

  return (
    <>
      <header className="glass fixed inset-x-0 top-0 z-30 flex h-16 items-center px-4 shadow-sm shadow-black/5 dark:shadow-black/30">
        <div className="flex flex-1 items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 shadow-md shadow-amber-500/30">
            <span className="text-xs font-bold text-white">試</span>
          </div>
          <span className="text-gradient-brand text-lg font-bold tracking-tight">
            {t('app.title')}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <LanguageToggle />

          <button
            onClick={toggleTheme}
            className="group rounded-lg p-2 text-slate-500 transition-colors hover:bg-black/5 hover:text-slate-900 dark:text-white/60 dark:hover:bg-white/10 dark:hover:text-white"
            aria-label="Toggle theme"
          >
            <span className="block transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110">
              {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
            </span>
          </button>

          <button
            onClick={onMenuToggle}
            className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-black/5 hover:text-slate-900 focus:outline-none dark:text-white/60 dark:hover:bg-white/10 dark:hover:text-white"
            aria-label="Toggle menu"
          >
            <span className={`block transition-transform duration-300 ${isMenuOpen ? 'rotate-90 scale-90' : 'rotate-0 scale-100'}`}>
              {isMenuOpen ? (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </span>
          </button>
        </div>
      </header>
    </>
  );
};

export { Navbar };
