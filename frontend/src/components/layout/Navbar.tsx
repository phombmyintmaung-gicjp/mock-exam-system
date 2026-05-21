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
      <header className="fixed inset-x-0 top-0 z-30 flex h-16 items-center border-b border-gray-200 bg-white px-4 shadow-sm">
        <button
          onClick={onMenuToggle}
          className="mr-3 rounded-md p-2 text-gray-500 hover:bg-gray-100 focus:outline-none lg:hidden"
          aria-label="Toggle menu"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <span className="flex-1 text-lg font-bold text-blue-600">Mock Exam System</span>
        <div className="flex items-center gap-3">
          <LanguageToggle />
          <div className="flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
              {initial}
            </div>
            <span className="hidden max-w-[120px] truncate text-sm font-medium text-gray-700 sm:inline">
              {user?.name ?? 'User'}
            </span>
          </div>
          <button
            onClick={() => setShowLogoutModal(true)}
            className="rounded-lg px-3 py-1.5 text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors"
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
