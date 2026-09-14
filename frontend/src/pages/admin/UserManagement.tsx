import { useTranslation } from 'react-i18next';
import { PageShell } from '@/components/layout/PageShell';

// One-Login migration (2026-09): retired entirely. mockexam_users no longer exists — "ALL
// USERS come from [Main's] USERS TABLE." User management (create/edit/delete/role) now
// happens at the Main Staff Portal's own Admin Users page; this app just picks up whatever
// identity Main already established the moment that person opens Mock.
const UserManagement = () => {
  const { t } = useTranslation();

  return (
    <PageShell>
      <div className="mx-auto max-w-2xl px-4 py-12">
        <h1 className="mb-4 text-2xl font-bold text-slate-900 dark:text-white">{t('admin.users.title')}</h1>
        <div className="glass-card rounded-2xl p-8 text-center">
          <p className="text-sm text-slate-600 dark:text-white/70">{t('admin.users.movedToMain')}</p>
        </div>
      </div>
    </PageShell>
  );
};

export default UserManagement;
