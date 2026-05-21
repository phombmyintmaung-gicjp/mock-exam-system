import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { PageShell } from '@/components/layout/PageShell';
import { Button } from '@/components/ui/Button';
import { TableRowSkeleton } from '@/components/ui/Shimmer';
import { getAdminUsers } from '@/services/userService';
import type { User } from '@/types/user';

const UserManagement = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [fetchError, setFetchError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const res = await getAdminUsers();
      setUsers(res.data);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string }; status?: number } })
          ?.response?.data?.error ??
        (err instanceof Error ? err.message : 'Failed to load users');
      setFetchError(msg);
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const filtered = search
    ? users.filter(
        (u) =>
          u.name.toLowerCase().includes(search.toLowerCase()) ||
          u.email.toLowerCase().includes(search.toLowerCase()),
      )
    : users;

  const roleLabel: Record<string, string> = {
    admin: t('nav.admin'),
    employee: t('nav.employee'),
  };

  return (
    <PageShell>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('admin.users.title')}</h1>
          <p className="mt-1 text-sm text-gray-500">{t('admin.users.subtitle')}</p>
        </div>
        <Button label={t('admin.users.newButton')} onClick={() => navigate('/admin/users/new')} />
      </div>

      {fetchError && (
        <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {fetchError}
        </div>
      )}

      <div className="mb-4">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('admin.users.searchPlaceholder')}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:max-w-sm"
        />
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">{t('admin.users.columnName')}</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">{t('admin.users.columnEmail')}</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">{t('admin.users.columnDepartment')}</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">{t('admin.users.columnRole')}</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">{t('admin.users.columnActions')}</th>
              </tr>
            </thead>
            <tbody>
              {isLoading
                ? Array.from({ length: 6 }).map((_, i) => <TableRowSkeleton key={i} cols={5} />)
                : filtered.length === 0
                ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-400">{t('common.noData')}</td>
                    </tr>
                  )
                : filtered.map((user) => (
                    <tr key={user.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900">{user.name}</td>
                      <td className="px-6 py-4 text-gray-600">{user.email}</td>
                      <td className="px-6 py-4 text-gray-600">
                        {(user as User & { department?: { name: string } }).department?.name ?? '—'}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={
                            user.role === 'admin'
                              ? 'inline-flex rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-700'
                              : 'inline-flex rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600'
                          }
                        >
                          {roleLabel[user.role] ?? user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          className="text-xs font-medium text-blue-600 hover:text-blue-800"
                          onClick={() => navigate(`/admin/users/${user.id}/edit`)}
                        >
                          {t('common.edit')}
                        </button>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      </div>
    </PageShell>
  );
};

export default UserManagement;
