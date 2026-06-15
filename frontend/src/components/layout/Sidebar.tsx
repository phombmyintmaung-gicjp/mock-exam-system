import { clsx } from 'clsx';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/store/authStore';
import { logout as logoutApi } from '@/services/authService';

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

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    try { await logoutApi(); } catch {}
    logout();
    navigate('/');
  };

  const adminLinks: NavLinkItem[] = [
    { to: '/admin/dashboard', label: t('nav.dashboard'), icon: <DashboardIcon /> },
    { to: '/admin/questions', label: t('nav.questions'), icon: <QuestionsIcon /> },
    { to: '/admin/users', label: t('nav.users'), icon: <UsersIcon /> },
    { to: '/admin/exams', label: t('nav.examSettings'), icon: <SettingsIcon /> },
    { to: '/admin/passages', label: t('nav.passages'), icon: <PassagesIcon /> },
    { to: '/admin/reports', label: t('nav.reports'), icon: <ReportsIcon /> },
  ];

  const itLinks: NavLinkItem[] = [
    { to: '/exam/select', label: t('nav.itExamSelect'), icon: <ExamIcon /> },
  ];

  const jlptLinks: NavLinkItem[] = [
    { to: '/exam/select', search: '?type=jlpt', label: t('nav.jlptPractice'), icon: <JapaneseIcon /> },
  ];

  const profileLinks: NavLinkItem[] = [
    { to: '/profile/history', label: t('nav.history'), icon: <HistoryIcon /> },
    { to: '/profile/weak-areas', label: t('nav.weakAreas'), icon: <WeakAreasIcon /> },
    { to: '/profile', label: t('nav.profile'), icon: <ProfileIcon />, end: true },
  ];

  const isAdmin = user?.role === 'admin';

  const renderSection = (label: string, links: NavLinkItem[], accent?: 'indigo' | 'rose') => (
    <div>
      <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-white/30">
        {label}
      </p>
      <ul className="space-y-0.5">
        {links.map((link) => {
          const href = link.to + (link.search ?? '');
          const pathMatch = link.end
            ? location.pathname === link.to
            : location.pathname === link.to || location.pathname.startsWith(link.to + '/');
          const searchMatch = link.search
            ? location.search === link.search
            : location.search !== '?type=jlpt';
          const isActive = pathMatch && searchMatch;
          return (
            <li key={href}>
              <Link
                to={href}
                onClick={onClose}
                className={clsx(
                  'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all',
                  isActive && accent === 'rose'
                    ? 'border border-rose-200 bg-gradient-to-r from-rose-100 to-pink-100 text-rose-700 shadow-sm shadow-rose-200/50 dark:border-rose-400/30 dark:from-rose-500/25 dark:to-pink-500/25 dark:text-white dark:shadow-rose-500/10'
                    : isActive
                    ? 'border border-indigo-200 bg-gradient-to-r from-indigo-100 to-violet-100 text-indigo-700 shadow-sm shadow-indigo-200/50 dark:border-indigo-400/30 dark:from-indigo-500/30 dark:to-violet-500/30 dark:text-white dark:shadow-indigo-500/10'
                    : 'text-slate-600 hover:bg-black/5 hover:text-slate-900 dark:text-white/55 dark:hover:bg-white/8 dark:hover:text-white/90',
                )}
              >
                {link.icon}
                {link.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-10 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      <aside
        className={clsx(
          'glass fixed inset-y-0 left-0 top-16 z-20 flex w-64 flex-col transition-transform duration-200',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        )}
      >
        <nav className="flex-1 overflow-y-auto p-3 pt-4 space-y-6 pb-2">
          {isAdmin && renderSection(t('nav.admin'), adminLinks)}
          {!isAdmin && renderSection(t('nav.itExam'), itLinks)}
          {!isAdmin && renderSection(t('nav.japaneseExam'), jlptLinks, 'rose')}
          {!isAdmin && renderSection(t('nav.myAccount'), profileLinks)}
        </nav>

        <div className="border-t border-slate-200 p-3 dark:border-white/10">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600 dark:text-white/40 dark:hover:bg-rose-500/15 dark:hover:text-rose-300"
          >
            <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
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
