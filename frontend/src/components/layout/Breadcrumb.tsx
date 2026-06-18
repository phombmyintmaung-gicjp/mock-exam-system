import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/store/authStore';
import { HomeIcon, ChevronRightIcon } from '@/components/ui/Icons';

interface Crumb {
  label: string;
  href: string;
}

const SESSION_PATHS = ['/exam/session', '/study/session', '/reading/session'];
const SKIP_SEGMENTS = new Set(['admin', 'exam', 'study', 'reading']);
const IS_NUMERIC = (s: string) => /^\d+$/.test(s);

const Breadcrumb = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const { user } = useAuthStore();

  if (SESSION_PATHS.some((p) => location.pathname.startsWith(p))) return null;

  const isAdmin = user?.role === 'admin';
  const homeHref = isAdmin ? '/admin/dashboard' : '/exam/select';

  const labelMap: Record<string, string> = {
    dashboard:    t('nav.dashboard'),
    questions:    t('nav.questions'),
    users:        t('nav.users'),
    exams:        t('nav.examSettings'),
    passages:     t('nav.passages'),
    reports:      t('nav.reports'),
    select:       t('exam.selectTitle'),
    results:      t('result.title'),
    review:       t('result.review.title'),
    profile:      t('nav.profile'),
    history:      t('nav.history'),
    'weak-areas': t('nav.weakAreas'),
    new:          t('common.new'),
    import:       t('admin.questionImport.title'),
    edit:         t('common.edit'),
  };

  const segments = location.pathname.split('/').filter(Boolean);
  const crumbs: Crumb[] = [];
  let path = '';

  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    path += '/' + seg;
    if (SKIP_SEGMENTS.has(seg) || IS_NUMERIC(seg)) continue;
    // If the next segment is a numeric ID (e.g. /exam/results/40), include it in
    // this crumb's href so the link resolves to a real route instead of /exam/results.
    const nextSeg = segments[i + 1];
    const href = nextSeg && IS_NUMERIC(nextSeg) ? path + '/' + nextSeg : path;
    crumbs.push({ label: labelMap[seg] ?? seg, href });
  }

  const isHome = location.pathname === homeHref;

  return (
    <nav className="mb-6 flex items-center gap-1.5 text-sm" aria-label="Breadcrumb">
      {isHome || crumbs.length === 0 ? (
        <span className="flex items-center gap-1.5 font-medium text-slate-600 dark:text-white/70">
          <HomeIcon className="h-4 w-4" />
          {crumbs[0]?.label ?? t('nav.dashboard')}
        </span>
      ) : (
        <>
          <Link
            to={homeHref}
            className="flex items-center gap-1 text-slate-400 transition-colors hover:text-amber-600 dark:text-white/35 dark:hover:text-amber-400"
            aria-label="Home"
          >
            <HomeIcon className="h-4 w-4" />
          </Link>

          {crumbs.map((crumb, i) => {
            const isLast = i === crumbs.length - 1;
            return (
              <span key={crumb.href} className="flex items-center gap-1.5">
                <ChevronRightIcon className="h-3.5 w-3.5 shrink-0 text-slate-300 dark:text-white/20" />
                {isLast ? (
                  <span className="font-medium text-slate-700 dark:text-white/80">
                    {crumb.label}
                  </span>
                ) : (
                  <Link
                    to={crumb.href}
                    className="text-slate-400 transition-colors hover:text-amber-600 dark:text-white/35 dark:hover:text-amber-400"
                  >
                    {crumb.label}
                  </Link>
                )}
              </span>
            );
          })}
        </>
      )}
    </nav>
  );
};

export { Breadcrumb };
