import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { PageShell } from '@/components/layout/PageShell';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { getAdminUser, createAdminUser, updateAdminUser } from '@/services/userService';

const UserForm = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);

  const [isLoading, setIsLoading] = useState(isEdit);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<1 | 2>(2);
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (!isEdit || !id) return;
    getAdminUser(Number(id))
      .then((u) => {
        setName(u.name);
        setEmail(u.email);
        setRole(u.role);
      })
      .catch(() => setError(t('common.error')))
      .finally(() => setIsLoading(false));
  }, [id, isEdit, t]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    const payload: Record<string, unknown> = {
      name,
      email,
      role,
    };
    if (password) payload.password = password;

    try {
      if (isEdit && id) {
        await updateAdminUser(Number(id), payload);
      } else {
        await createAdminUser(payload);
      }
      navigate('/admin/users');
    } catch {
      setError(t('common.error'));
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <PageShell>
        <div className="flex min-h-[40vh] items-center justify-center">
          <Spinner size="lg" />
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {isEdit ? t('admin.userForm.editTitle') : t('admin.userForm.title')}
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-white/50">
          {isEdit ? t('admin.userForm.editSubtitle') : t('admin.userForm.subtitle')}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="w-full max-w-2xl rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 p-6 shadow-sm md:p-8">
        {error && <p className="mb-4 rounded-lg bg-red-50 dark:bg-rose-500/15 px-4 py-3 text-sm text-red-600 dark:text-rose-300">{error}</p>}

        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-white/80">{t('admin.userForm.name')}</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-gray-300 dark:border-white/15 dark:bg-white/5 dark:text-white px-3 py-2.5 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                placeholder={t('admin.userForm.namePlaceholder')}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-white/80">{t('admin.userForm.email')}</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-gray-300 dark:border-white/15 dark:bg-white/5 dark:text-white px-3 py-2.5 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                placeholder={t('admin.userForm.emailPlaceholder')}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-white/80">{t('admin.userForm.role')}</label>
            <select
              value={role}
              onChange={(e) => setRole(Number(e.target.value) as 1 | 2)}
              className="mt-1 block w-full rounded-lg border border-gray-300 dark:border-white/15 dark:bg-white/5 dark:text-white px-3 py-2.5 text-sm text-gray-700 dark:text-white focus:border-blue-500 focus:outline-none sm:max-w-xs"
            >
              <option value={2}>{t('nav.employee')}</option>
              <option value={1}>{t('nav.admin')}</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-white/80">
              {t('admin.userForm.password')}
              {isEdit && <span className="ml-1 text-xs font-normal text-gray-400 dark:text-white/40">({t('admin.userForm.passwordOptional')})</span>}
            </label>
            <input
              type="password"
              required={!isEdit}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-gray-300 dark:border-white/15 dark:bg-white/5 dark:text-white px-3 py-2.5 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
              placeholder={t('admin.userForm.passwordPlaceholder')}
            />
          </div>

          <div className="flex flex-wrap justify-end gap-3">
            <Button label={t('common.cancel')} variant="secondary" type="button" onClick={() => navigate('/admin/users')} />
            <Button label={isSaving ? t('common.saving') : t('admin.userForm.saveButton')} disabled={isSaving} type="submit" />
          </div>
        </div>
      </form>
    </PageShell>
  );
};

export default UserForm;
