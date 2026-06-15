import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LanguageToggle } from '@/components/shared/LanguageToggle';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';
import { logout as logoutApi } from '@/services/authService';

interface NavbarProps {
  onMenuToggle: () => void;
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

const Navbar = ({ onMenuToggle }: NavbarProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const initial = user?.name?.[0]?.toUpperCase() ?? 'U';
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const confirmLogout = async () => {
    setShowLogoutModal(false);
    try { await logoutApi(); } catch {}
    logout();
    navigate('/login');
  };

  return (
    <>
      <header className="glass fixed inset-x-0 top-0 z-30 flex h-16 items-center px-4 shadow-sm shadow-black/5 dark:shadow-black/30">
        <button
          onClick={onMenuToggle}
          className="mr-3 rounded-lg p-2 text-slate-500 transition-colors hover:bg-black/5 hover:text-slate-900 focus:outline-none dark:text-white/60 dark:hover:bg-white/10 dark:hover:text-white lg:hidden"
          aria-label="Toggle menu"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <div className="flex flex-1 items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 shadow-md shadow-indigo-500/30">
            <span className="text-xs font-bold text-white">試</span>
          </div>
          <span className="text-gradient-brand text-lg font-bold tracking-tight">
            {t('app.title')}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <LanguageToggle />

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-black/5 hover:text-slate-900 dark:text-white/60 dark:hover:bg-white/10 dark:hover:text-white"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
          </button>

          <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3 py-1.5 dark:border-white/15 dark:bg-white/10">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 text-xs font-bold text-white shadow-sm">
              {initial}
            </div>
            <span className="hidden max-w-[120px] truncate text-sm font-medium text-slate-700 dark:text-white/85 sm:inline">
              {user?.name ?? 'User'}
            </span>
          </div>

          <button
            onClick={() => setShowLogoutModal(true)}
            className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-500 transition-colors hover:bg-rose-50 hover:text-rose-600 dark:text-white/50 dark:hover:bg-rose-500/20 dark:hover:text-rose-300"
          >
            {t('auth.logout')}
          </button>
        </div>
      </header>

      <Modal
        isOpen={showLogoutModal}
        title={t('auth.logoutConfirmTitle')}
        onClose={() => setShowLogoutModal(false)}
      >
        <p className="mb-6 text-slate-600 dark:text-white/75">{t('auth.logoutConfirmMessage')}</p>
        <div className="flex justify-end gap-3">
          <Button label={t('common.cancel')} variant="secondary" onClick={() => setShowLogoutModal(false)} />
          <Button label={t('auth.logoutConfirmButton')} variant="danger" onClick={confirmLogout} />
        </div>
      </Modal>
    </>
  );
};

export { Navbar };
