import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { PageShell } from '@/components/layout/PageShell';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Pagination } from '@/components/ui/Pagination';
import { TableRowSkeleton } from '@/components/ui/Shimmer';
import { getAdminUsers, approveUser, rejectUser, deleteAdminUser, toggleUserActive } from '@/services/userService';
import { useAuthStore } from '@/store/authStore';
import type { User } from '@/types/user';

const PER_PAGE = 25;

const UserManagement = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user: currentUser } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [pendingUsers, setPendingUsers] = useState<User[]>([]);
  const [pendingLoading, setPendingLoading] = useState(true);
  const [approvingId, setApprovingId] = useState<number | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const [togglingId, setTogglingId] = useState<number | null>(null);
  const [toggleTarget, setToggleTarget] = useState<User | null>(null);

  const fetchPendingUsers = useCallback(async () => {
    setPendingLoading(true);
    try {
      const res = await getAdminUsers({ approval_status: 'pending' });
      setPendingUsers(res.data);
    } catch {
      setPendingUsers([]);
    } finally {
      setPendingLoading(false);
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const params: Record<string, string> = { page: String(page) };
      const res = await getAdminUsers(params);
      setUsers(res.data);
      setTotalCount(res.count);
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
  }, [page]);

  useEffect(() => { fetchPendingUsers(); }, [fetchPendingUsers]);
  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleApprove = async (id: number) => {
    setApprovingId(id);
    try {
      await approveUser(id);
      await Promise.all([fetchPendingUsers(), fetchUsers()]);
    } finally {
      setApprovingId(null);
    }
  };

  const handleReject = async (id: number) => {
    setApprovingId(id);
    try {
      await rejectUser(id);
      await Promise.all([fetchPendingUsers(), fetchUsers()]);
    } finally {
      setApprovingId(null);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await deleteAdminUser(deleteTarget.id);
      setDeleteTarget(null);
      await Promise.all([fetchUsers(), fetchPendingUsers()]);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ??
        t('common.error');
      setDeleteError(msg);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleConfirm = async () => {
    if (!toggleTarget) return;
    setTogglingId(toggleTarget.id);
    try {
      await toggleUserActive(toggleTarget.id, !toggleTarget.is_active);
      setToggleTarget(null);
      await fetchUsers();
    } finally {
      setTogglingId(null);
    }
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const filtered = search
    ? users.filter(
        (u) =>
          u.name.toLowerCase().includes(search.toLowerCase()) ||
          u.email.toLowerCase().includes(search.toLowerCase()),
      )
    : users;

  const totalPages = Math.max(1, Math.ceil(totalCount / PER_PAGE));

  const roleLabel: Record<number, string> = {
    1: t('nav.admin'),
    2: t('nav.employee'),
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <PageShell>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('admin.users.title')}</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-white/50">{t('admin.users.subtitle')}</p>
        </div>
        <Button label={t('admin.users.newButton')} onClick={() => navigate('/admin/users/new')} />
      </div>

      {/* Pending Approvals Section */}
      {(pendingLoading || pendingUsers.length > 0) && (
        <div className="mb-6">
          <h2 className="mb-3 text-base font-semibold text-gray-800 dark:text-white/90 flex items-center gap-2">
            <span className="inline-flex h-2 w-2 rounded-full bg-amber-400" />
            {t('admin.users.pendingApprovals')}
            {!pendingLoading && pendingUsers.length > 0 && (
              <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                {pendingUsers.length}
              </span>
            )}
          </h2>
          <div className="overflow-hidden rounded-xl border border-amber-200 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/10 shadow-sm">
            {pendingLoading ? (
              <div className="p-4">
                {Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="mb-3 last:mb-0 flex items-center gap-4 animate-pulse">
                    <div className="h-4 w-40 rounded bg-amber-200" />
                    <div className="h-4 w-56 rounded bg-amber-200" />
                    <div className="ml-auto h-4 w-24 rounded bg-amber-200" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="divide-y divide-amber-100 dark:divide-amber-500/20">
                {pendingUsers.map((user) => (
                  <div key={user.id} className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:gap-4">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</p>
                      <p className="text-xs text-gray-500 dark:text-white/50">{user.email}</p>
                    </div>
                    <p className="text-xs text-gray-400 dark:text-white/40 shrink-0">{formatDate(user.created_at)}</p>
                    <div className="flex gap-2 shrink-0">
                      <button
                        className="rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-emerald-600 disabled:opacity-50"
                        disabled={approvingId === user.id}
                        onClick={() => handleApprove(user.id)}
                      >
                        {t('admin.users.approve')}
                      </button>
                      <button
                        className="rounded-lg bg-rose-500 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-rose-600 disabled:opacity-50"
                        disabled={approvingId === user.id}
                        onClick={() => handleReject(user.id)}
                      >
                        {t('admin.users.reject')}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {fetchError && (
        <div className="mb-4 rounded-lg bg-red-50 dark:bg-rose-500/15 px-4 py-3 text-sm text-red-700 dark:text-rose-300">
          {fetchError}
        </div>
      )}

      <div className="mb-4">
        <input
          type="search"
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder={t('admin.users.searchPlaceholder')}
          className="w-full rounded-lg border border-gray-300 dark:border-white/15 dark:bg-white/5 dark:text-white dark:placeholder-white/40 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 sm:max-w-sm"
        />
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5">
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-white/45">{t('admin.users.columnName')}</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-white/45">{t('admin.users.columnEmail')}</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-white/45">{t('admin.users.columnRole')}</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-white/45">{t('admin.users.columnStatus')}</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-white/45">{t('admin.users.columnActions')}</th>
              </tr>
            </thead>
            <tbody>
              {isLoading
                ? Array.from({ length: 6 }).map((_, i) => <TableRowSkeleton key={i} cols={4} />)
                : filtered.length === 0
                ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-400 dark:text-white/30">{t('common.noData')}</td>
                    </tr>
                  )
                : filtered.map((user) => (
                    <tr key={user.id} className="border-b border-gray-100 dark:border-white/5 last:border-0 hover:bg-gray-50 dark:hover:bg-white/5">
                      <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{user.name}</td>
                      <td className="px-6 py-4 text-gray-600 dark:text-white/60">{user.email}</td>
                      <td className="px-6 py-4">
                        <span
                          className={
                            user.role === 1
                              ? 'inline-flex rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700'
                              : 'inline-flex rounded-full bg-gray-100 dark:bg-white/10 px-2.5 py-0.5 text-xs font-medium text-gray-600 dark:text-white/60'
                          }
                        >
                          {roleLabel[user.role] ?? String(user.role)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {currentUser?.id === user.id ? (
                          <span className="inline-flex rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                            {t('admin.users.statusActive')}
                          </span>
                        ) : (
                          <button
                            disabled={togglingId === user.id}
                            onClick={() => setToggleTarget(user)}
                            className={
                              user.is_active
                                ? 'inline-flex rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700 transition-colors hover:bg-emerald-200 disabled:opacity-50'
                                : 'inline-flex rounded-full bg-gray-100 dark:bg-white/10 px-2.5 py-0.5 text-xs font-medium text-gray-500 dark:text-white/50 transition-colors hover:bg-gray-200 dark:hover:bg-white/20 disabled:opacity-50'
                            }
                          >
                            {togglingId === user.id
                              ? '...'
                              : user.is_active
                                ? t('admin.users.statusActive')
                                : t('admin.users.statusInactive')}
                          </button>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <button
                            className="text-xs font-medium text-amber-600 hover:text-amber-800"
                            onClick={() => navigate(`/admin/users/${user.id}/edit`)}
                          >
                            {t('common.edit')}
                          </button>
                          {currentUser?.id !== user.id && (
                            <button
                              className="text-xs font-medium text-rose-500 hover:text-rose-700"
                              onClick={() => { setDeleteError(null); setDeleteTarget(user); }}
                            >
                              {t('common.delete')}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        )}
      </div>

      <Modal
        isOpen={toggleTarget !== null}
        title={toggleTarget?.is_active ? t('admin.users.deactivateTitle') : t('admin.users.activateTitle')}
        onClose={() => { if (!togglingId) setToggleTarget(null); }}
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-white/70">
            {toggleTarget?.is_active ? t('admin.users.deactivateBody') : t('admin.users.activateBody')}
          </p>
          {toggleTarget && (
            <div className="rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 px-4 py-3">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">{toggleTarget.name}</p>
              <p className="text-xs text-gray-500 dark:text-white/50">{toggleTarget.email}</p>
            </div>
          )}
          <div className="flex justify-end gap-3">
            <Button
              label={t('common.cancel')}
              variant="secondary"
              disabled={togglingId !== null}
              onClick={() => setToggleTarget(null)}
            />
            <Button
              label={togglingId !== null ? '...' : toggleTarget?.is_active ? t('admin.users.deactivateConfirm') : t('admin.users.activateConfirm')}
              variant={toggleTarget?.is_active ? 'danger' : 'primary'}
              disabled={togglingId !== null}
              onClick={handleToggleConfirm}
            />
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={deleteTarget !== null}
        title={t('admin.users.deleteConfirmTitle')}
        onClose={() => { if (!isDeleting) { setDeleteTarget(null); setDeleteError(null); } }}
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-white/70">{t('admin.users.deleteConfirmBody')}</p>
          {deleteTarget && (
            <div className="rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 px-4 py-3">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">{deleteTarget.name}</p>
              <p className="text-xs text-gray-500 dark:text-white/50">{deleteTarget.email}</p>
            </div>
          )}
          {deleteError && (
            <p className="text-sm text-rose-600">{deleteError}</p>
          )}
          <div className="flex justify-end gap-3">
            <Button
              label={t('common.cancel')}
              variant="secondary"
              disabled={isDeleting}
              onClick={() => { setDeleteTarget(null); setDeleteError(null); }}
            />
            <Button
              label={isDeleting ? t('admin.users.deleting') : t('common.delete')}
              variant="danger"
              disabled={isDeleting}
              onClick={handleDeleteConfirm}
            />
          </div>
        </div>
      </Modal>
    </PageShell>
  );
};

export default UserManagement;
