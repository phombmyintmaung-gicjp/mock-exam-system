import { useState } from 'react';
import { clsx } from 'clsx';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/store/authStore';
import { useExamGuardStore } from '@/store/examGuardStore';
import { logout as logoutApi } from '@/services/authService';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const DashboardIcon = () => (
  <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);

const QuestionsIcon = () => (
  <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const UsersIcon = () => (
  <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const SettingsIcon = () => (
  <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const ReportsIcon = () => (
  <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

const ExamIcon = () => (
  <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
  </svg>
);

const HistoryIcon = () => (
  <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const WeakAreasIcon = () => (
  <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);

const ProfileIcon = () => (
  <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const CategoriesIcon = () => (
  <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
  </svg>
);

const PassagesIcon = () => (
  <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const JapaneseIcon = () => (
  <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
  </svg>
);

interface NavLinkItem {
  to: string;
  search?: string;
  label: string;
  icon: React.ReactNode;
  end?: boolean;
}

interface NavSection {
  title?: string;
  links: NavLinkItem[];
}

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const isExamActive   = useExamGuardStore((s) => s.isActive);
  const setPendingPath = useExamGuardStore((s) => s.setPendingPath);

  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = async () => {
    try { await logoutApi(); } catch {}
    logout();
    navigate('/');
  };

  const adminSections: NavSection[] = [
    {
      links: [
        { to: '/admin/dashboard', label: t('nav.dashboard'), icon: <DashboardIcon /> },
      ],
    },
    {
      title: t('nav.contentGroup'),
      links: [
        { to: '/admin/questions',  label: t('nav.questions'),  icon: <QuestionsIcon /> },
        { to: '/admin/passages',   label: t('nav.passages'),   icon: <PassagesIcon /> },
        { to: '/admin/categories', label: t('nav.categories'), icon: <CategoriesIcon /> },
      ],
    },
    {
      title: t('nav.usersGroup'),
      links: [
        { to: '/admin/users', label: t('nav.users'), icon: <UsersIcon /> },
      ],
    },
    {
      title: t('nav.systemGroup'),
      links: [
        { to: '/admin/exams',   label: t('nav.examSettings'), icon: <SettingsIcon /> },
        { to: '/admin/reports', label: t('nav.reports'),      icon: <ReportsIcon /> },
      ],
    },
  ];

  const itLinks: NavLinkItem[] = [
    { to: '/exam/select', label: t('nav.itExamSelect'), icon: <ExamIcon /> },
  ];

  const jlptLinks: NavLinkItem[] = [
    { to: '/exam/select', search: '?type=jlpt', label: t('nav.jlptPractice'), icon: <JapaneseIcon /> },
  ];

  const profileLinks: NavLinkItem[] = [
    { to: '/profile/history',    label: t('nav.history'),   icon: <HistoryIcon /> },
    { to: '/profile/weak-areas', label: t('nav.weakAreas'), icon: <WeakAreasIcon /> },
    { to: '/profile',            label: t('nav.profile'),   icon: <ProfileIcon />, end: true },
  ];

  const isAdmin = user?.role === 'admin';

  const renderNavItem = (link: NavLinkItem, accent?: 'amber' | 'rose') => {
    const href = link.to + (link.search ?? '');
    const pathMatch = link.end
      ? location.pathname === link.to
      : location.pathname === link.to || location.pathname.startsWith(link.to + '/');
    const searchMatch = link.search
      ? location.search === link.search
      : location.search !== '?type=jlpt';
    const isActive = pathMatch && searchMatch;
    const cls = clsx(
      'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all w-full text-left',
      isActive && accent === 'rose'
        ? 'border border-rose-200 bg-gradient-to-r from-rose-100 to-pink-100 text-rose-700 shadow-sm shadow-rose-200/50 dark:border-rose-400/30 dark:from-rose-500/25 dark:to-pink-500/25 dark:text-white dark:shadow-rose-500/10'
        : isActive
        ? 'border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 text-amber-800 shadow-sm shadow-amber-200/50 dark:border-amber-400/30 dark:from-amber-500/25 dark:to-orange-500/20 dark:text-white dark:shadow-amber-500/10'
        : 'text-slate-600 hover:bg-black/5 hover:text-slate-900 dark:text-white/55 dark:hover:bg-white/8 dark:hover:text-white/90',
    );
    return (
      <li key={href}>
        {isExamActive ? (
          <button onClick={() => { onClose(); setPendingPath(href); }} className={cls}>
            <span className="shrink-0 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:scale-110">{link.icon}</span>
            {link.label}
          </button>
        ) : (
          <Link to={href} onClick={onClose} className={cls}>
            <span className="shrink-0 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:scale-110">{link.icon}</span>
            {link.label}
          </Link>
        )}
      </li>
    );
  };

  const renderSection = (label: string, links: NavLinkItem[], accent?: 'amber' | 'rose') => (
    <div>
      <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-white/30">
        {label}
      </p>
      <ul className="space-y-0.5">
        {links.map((link) => renderNavItem(link, accent))}
      </ul>
    </div>
  );

  const renderAdminSections = () => (
    <div className="space-y-4">
      <p className="px-3 text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-white/30">
        {t('nav.admin')}
      </p>
      {adminSections.map((section, i) => (
        <div key={i}>
          {section.title && (
            <p className="mb-1 mt-1 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-white/40">
              {section.title}
            </p>
          )}
          <ul className="space-y-0.5">
            {section.links.map((link) => renderNavItem(link))}
          </ul>
        </div>
      ))}
    </div>
  );

  const initial = user?.name?.[0]?.toUpperCase() ?? 'U';

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-10 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      <aside
        className={clsx(
          'glass fixed right-0 top-16 bottom-0 z-20 flex w-72 flex-col transition-transform duration-300',
          isOpen ? 'translate-x-0' : 'translate-x-full',
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 p-4 dark:border-white/10">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-sm font-bold text-white shadow-sm">
              {initial}
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800 dark:text-white">{user?.name ?? 'User'}</p>
              <p className="text-xs text-slate-400 dark:text-white/40">{user?.email ?? ''}</p>
            </div>
          </div>
        </div>

        {/* Nav links */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-6">
          {isAdmin && renderAdminSections()}
          {!isAdmin && renderSection(t('nav.itExam'), itLinks, 'amber')}
          {!isAdmin && renderSection(t('nav.japaneseExam'), jlptLinks, 'rose')}
          {!isAdmin && renderSection(t('nav.myAccount'), profileLinks)}
        </nav>

        {/* Logout */}
        <div className="border-t border-slate-200 p-4 dark:border-white/10">
          <button
            onClick={() => setShowLogoutModal(true)}
            className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600 dark:text-white/40 dark:hover:bg-rose-500/15 dark:hover:text-rose-300"
          >
            <svg className="h-4 w-4 shrink-0 transition-transform duration-150 group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            {t('auth.logout')}
          </button>
        </div>
      </aside>

      <Modal
        isOpen={showLogoutModal}
        title={t('auth.logoutConfirmTitle')}
        onClose={() => setShowLogoutModal(false)}
      >
        <p className="mb-6 text-sm text-slate-600 dark:text-white/70">{t('auth.logoutConfirmMessage')}</p>
        <div className="flex justify-end gap-3">
          <Button label={t('common.cancel')} variant="secondary" onClick={() => setShowLogoutModal(false)} />
          <Button label={t('auth.logout')} variant="danger" onClick={handleLogout} />
        </div>
      </Modal>
    </>
  );
};

export { Sidebar };
