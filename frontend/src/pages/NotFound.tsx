import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/store/authStore';
import { ArrowLeftIcon } from '@/components/ui/Icons';

const NotFound = () => {
  const { t } = useTranslation();
  const { token, user } = useAuthStore();

  const homePath = token
    ? user?.role === 'admin' ? '/admin/dashboard' : '/exam/select'
    : '/';

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-app overflow-hidden px-4">
      {/* Decorative orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -top-48 -left-48 h-96 w-96 rounded-full bg-amber-400/15 blur-3xl dark:bg-amber-500/12" />
        <div className="absolute -bottom-32 -right-32 h-80 w-80 rounded-full bg-rose-400/12 blur-3xl dark:bg-rose-500/10" />
      </div>

      <div className="relative z-10 flex flex-col items-center text-center">
        {/* 404 number */}
        <div className="text-[8rem] font-extrabold leading-none tracking-tight text-slate-900/10 dark:text-white/8 select-none sm:text-[12rem]">
          404
        </div>

        {/* Icon */}
        <div className="-mt-8 mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-xl shadow-amber-500/30">
          <span className="text-4xl">？</span>
        </div>

        <h1 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
          {t('notFound.title')}
        </h1>
        <p className="mt-3 max-w-sm text-sm text-slate-500 dark:text-white/50">
          {t('notFound.subtitle')}
        </p>

        <Link
          to={homePath}
          className="mt-8 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-amber-500/25 transition-all hover:opacity-90"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          {t('notFound.backButton')}
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
