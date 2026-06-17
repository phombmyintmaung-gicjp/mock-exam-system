import { useTranslation } from 'react-i18next';
import { LanguageToggle } from '@/components/shared/LanguageToggle';
import { useThemeStore } from '@/store/themeStore';
import { SunIcon, MoonIcon, MenuIcon, XIcon } from '@/components/ui/Icons';

interface NavbarProps {
  onMenuToggle: () => void;
  isMenuOpen: boolean;
}

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
              {theme === 'dark'
                ? <SunIcon className="h-4 w-4" />
                : <MoonIcon className="h-4 w-4" />}
            </span>
          </button>

          <button
            onClick={onMenuToggle}
            className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-black/5 hover:text-slate-900 focus:outline-none dark:text-white/60 dark:hover:bg-white/10 dark:hover:text-white"
            aria-label="Toggle menu"
          >
            <span className={`block transition-transform duration-300 ${isMenuOpen ? 'rotate-90 scale-90' : 'rotate-0 scale-100'}`}>
              {isMenuOpen
                ? <XIcon className="h-5 w-5" />
                : <MenuIcon className="h-5 w-5" />}
            </span>
          </button>
        </div>
      </header>
    </>
  );
};

export { Navbar };
