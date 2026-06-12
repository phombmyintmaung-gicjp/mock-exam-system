import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LanguageToggle } from '@/components/shared/LanguageToggle';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/store/authStore';
import { logout as logoutApi } from '@/services/authService';

interface NavbarProps {
  onMenuToggle: () => void;
}

const Navbar = ({ onMenuToggle }: NavbarProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
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
      <header className="bg-gradient-dark fixed inset-x-0 top-0 z-30 flex h-16 items-center border-b border-white/10 px-4 shadow-lg">
        <button
          onClick={onMenuToggle}
          className="mr-3 rounded-lg p-2 text-white/70 transition-colors hover:bg-white/10 hover:text-white focus:outline-none lg:hidden"
          aria-label="Toggle menu"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <div className="flex flex-1 items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-rose-500 to-rose-600 shadow-md shadow-rose-500/30">
            <span className="text-xs font-bold text-white">試</span>
          </div>
          <span className="text-gradient-brand text-lg font-bold tracking-tight">
            {t('app.title')}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <LanguageToggle variant="dark" />
          <div className="flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 text-xs font-bold text-white shadow-sm">
              {initial}
            </div>
            <span className="hidden max-w-[120px] truncate text-sm font-medium text-white/90 sm:inline">
              {user?.name ?? 'User'}
            </span>
          </div>
          <button
            onClick={() => setShowLogoutModal(true)}
            className="rounded-lg px-3 py-1.5 text-sm font-medium text-white/60 transition-colors hover:bg-rose-500/20 hover:text-rose-300"
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
        <p className="mb-6">{t('auth.logoutConfirmMessage')}</p>
        <div className="flex justify-end gap-3">
          <Button label={t('common.cancel')} variant="secondary" onClick={() => setShowLogoutModal(false)} />
          <Button label={t('auth.logoutConfirmButton')} variant="danger" onClick={confirmLogout} />
        </div>
      </Modal>
    </>
  );
};

export { Navbar };
