import { clsx } from 'clsx';
import { NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/store/authStore';
import { logout as logoutApi } from '@/services/authService';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `block rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
    isActive
      ? 'bg-blue-50 text-blue-600'
      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
  }`;

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    try { await logoutApi(); } catch {}
    logout();
    navigate('/');
  };

  const adminLinks = [
    { to: '/admin/dashboard', label: t('nav.dashboard') },
    { to: '/admin/questions', label: t('nav.questions') },
    { to: '/admin/users', label: t('nav.users') },
    { to: '/admin/exams', label: t('nav.examSettings') },
    { to: '/admin/reports', label: t('nav.reports') },
  ];

  const clientLinks = [
    { to: '/exam/select', label: t('nav.examSelect') },
    { to: '/profile/history', label: t('nav.history') },
    { to: '/profile/weak-areas', label: t('nav.weakAreas') },
    { to: '/profile', label: t('nav.profile') },
  ];

  const isAdmin = user?.role === 'admin';

  const renderSection = (label: string, links: { to: string; label: string }[]) => (
    <div>
      <p className="mb-1 px-4 text-xs font-semibold uppercase tracking-wider text-gray-400">
        {label}
      </p>
      <ul className="space-y-0.5">
        {links.map((link) => (
          <li key={link.to}>
            <NavLink to={link.to} className={linkClass} onClick={onClose}>
              {link.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-10 bg-black/30 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      <aside
        className={clsx(
          'fixed inset-y-0 left-0 top-16 z-20 flex w-64 flex-col border-r border-gray-200 bg-white transition-transform duration-200',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        )}
      >
        <nav className="flex-1 overflow-y-auto p-4 space-y-6 pb-2">
          {isAdmin && renderSection(t('nav.admin'), adminLinks)}
          {renderSection(t('nav.employee'), clientLinks)}
        </nav>
        <div className="border-t border-gray-200 p-4">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-red-50 hover:text-red-600"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            {t('auth.logout')}
          </button>
        </div>
      </aside>
    </>
  );
};

export { Sidebar };
