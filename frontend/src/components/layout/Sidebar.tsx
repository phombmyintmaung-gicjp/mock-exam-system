import { useState } from 'react';
import { clsx } from 'clsx';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/store/authStore';
import { useExamGuardStore } from '@/store/examGuardStore';
import { logout as logoutApi } from '@/services/authService';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import {
  HomeIcon, HelpCircleIcon, UsersIcon, CogIcon, BarChartIcon,
  ClipboardCheckIcon, ClockIcon, BoltIcon, UserIcon, TagIcon,
  LayersIcon, DocumentTextIcon, BookOpenIcon, LogoutIcon,
} from '@/components/ui/Icons';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

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

  const si = 'h-4 w-4 shrink-0';

  const adminSections: NavSection[] = [
    {
      links: [
        { to: '/admin/dashboard', label: t('nav.dashboard'), icon: <HomeIcon className={si} /> },
      ],
    },
    {
      title: t('nav.contentGroup'),
      links: [
        { to: '/admin/questions',  label: t('nav.questions'),  icon: <HelpCircleIcon className={si} /> },
        { to: '/admin/passages',   label: t('nav.passages'),   icon: <DocumentTextIcon className={si} /> },
        { to: '/admin/categories', label: t('nav.categories'), icon: <TagIcon className={si} /> },
        { to: '/admin/flashcards', label: t('nav.flashcards'), icon: <LayersIcon className={si} /> },
        { to: '/admin/custom-sets', label: t('nav.customSets'), icon: <ClipboardCheckIcon className={si} /> },
      ],
    },
    {
      title: t('nav.usersGroup'),
      links: [
        { to: '/admin/users', label: t('nav.users'), icon: <UsersIcon className={si} /> },
      ],
    },
    {
      title: t('nav.systemGroup'),
      links: [
        { to: '/admin/exams',   label: t('nav.examSettings'), icon: <CogIcon className={si} /> },
        { to: '/admin/reports', label: t('nav.reports'),      icon: <BarChartIcon className={si} /> },
      ],
    },
  ];

  const itLinks: NavLinkItem[] = [
    { to: '/exam/select', label: t('nav.itExamSelect'), icon: <ClipboardCheckIcon className={si} /> },
  ];

  const jlptLinks: NavLinkItem[] = [
    { to: '/exam/select', search: '?type=jlpt', label: t('nav.jlptPractice'), icon: <BookOpenIcon className={si} /> },
  ];

  const flashcardLinks: NavLinkItem[] = [
    { to: '/study', label: t('nav.flashcards'), icon: <LayersIcon className={si} /> },
  ];

  const profileLinks: NavLinkItem[] = [
    { to: '/profile/history',    label: t('nav.history'),   icon: <ClockIcon className={si} /> },
    { to: '/profile/weak-areas', label: t('nav.weakAreas'), icon: <BoltIcon className={si} /> },
    { to: '/profile',            label: t('nav.profile'),   icon: <UserIcon className={si} />, end: true },
  ];

  const isAdmin = user?.role === 1;

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
          {!isAdmin && renderSection(t('nav.flashcardStudy'), flashcardLinks)}
          {!isAdmin && renderSection(t('nav.myAccount'), profileLinks)}
        </nav>

        {/* Logout */}
        <div className="border-t border-slate-200 p-4 dark:border-white/10">
          <button
            onClick={() => setShowLogoutModal(true)}
            className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600 dark:text-white/40 dark:hover:bg-rose-500/15 dark:hover:text-rose-300"
          >
            <LogoutIcon className="h-4 w-4 shrink-0 transition-transform duration-150 group-hover:translate-x-0.5" />
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
