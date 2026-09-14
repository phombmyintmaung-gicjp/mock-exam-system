import { useTranslation } from 'react-i18next';
import { PageShell } from '@/components/layout/PageShell';
import { useAuthStore } from '@/store/authStore';

// One-Login migration (2026-09): profile editing and password change are retired entirely
// — "ALL USERS come from [Main's] USERS TABLE" / "Auth Processes like ... Change Passwords
// are fully controlled by Main." target_certification (the other field this page used to
// edit) has no replacement — see SharedJwtAuth's own comment for why that feature was
// retired rather than rehomed. This page is now a read-only display pointing to Main.
const Profile = () => {
  const { t } = useTranslation();
  const { user } = useAuthStore();

  const initial = user?.name?.[0]?.toUpperCase() ?? 'U';

  return (
    <PageShell>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('profile.title')}</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-white/50">{t('profile.subtitle')}</p>
      </div>

      <div className="max-w-xl space-y-6">
        <div className="rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 p-8 shadow-sm">
          <div className="mb-6 flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-orange-500 text-2xl font-bold text-white">
              {initial}
            </div>
            <div>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">{user?.name}</p>
              <p className="text-sm text-gray-500 dark:text-white/50">{user?.email}</p>
            </div>
          </div>

          <p className="rounded-lg bg-amber-50 dark:bg-amber-500/10 px-4 py-3 text-sm text-amber-800 dark:text-amber-300">
            {t('profile.movedToMain')}
          </p>
        </div>
      </div>
    </PageShell>
  );
};

export default Profile;
