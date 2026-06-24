import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PageShell } from '@/components/layout/PageShell';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/store/authStore';
import { updateProfile, changePassword } from '@/services/userService';

const inputClass = (hasError: boolean) =>
  `mt-1 block w-full rounded-lg border px-3 py-2.5 text-sm focus:outline-none focus:ring-1 dark:bg-white/5 dark:text-white ${
    hasError
      ? 'border-red-400 dark:border-red-500/60 focus:border-red-500 focus:ring-red-500'
      : 'border-gray-300 dark:border-white/15 focus:border-amber-500 focus:ring-amber-500'
  }`;

const Profile = () => {
  const { t } = useTranslation();
  const { user, setAuth, token } = useAuthStore();

  /* ── Profile info ─────────────────────────────────────────────── */
  const [name, setName] = useState(user?.name ?? '');
  const [certification, setCertification] = useState(
    (user as typeof user & { target_certification?: string | null })?.target_certification ?? '',
  );
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    setProfileMsg(null);
    try {
      const updated = await updateProfile({ name, target_certification: certification || null });
      if (token) setAuth(updated, token);
      setProfileMsg({ type: 'success', text: t('profile.saved') });
    } catch {
      setProfileMsg({ type: 'error', text: t('common.error') });
    } finally {
      setIsSavingProfile(false);
    }
  };

  /* ── Password change ──────────────────────────────────────────── */
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [pwErrors, setPwErrors] = useState<Record<string, string>>({});
  const [isSavingPw, setIsSavingPw] = useState(false);
  const [pwMsg, setPwMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const validatePassword = (): boolean => {
    const errors: Record<string, string> = {};
    if (newPw.length < 8) errors.newPw = t('profile.changePassword.passwordTooShort');
    if (newPw !== confirmPw) errors.confirmPw = t('profile.changePassword.passwordMismatch');
    setPwErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwMsg(null);
    if (!validatePassword()) return;

    setIsSavingPw(true);
    try {
      await changePassword(currentPw, newPw, confirmPw);
      setPwMsg({ type: 'success', text: t('profile.changePassword.saved') });
      setCurrentPw('');
      setNewPw('');
      setConfirmPw('');
      setPwErrors({});
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      if (msg?.toLowerCase().includes('incorrect')) {
        setPwMsg({ type: 'error', text: t('profile.changePassword.wrongCurrent') });
      } else {
        setPwMsg({ type: 'error', text: t('common.error') });
      }
    } finally {
      setIsSavingPw(false);
    }
  };

  const initial = user?.name?.[0]?.toUpperCase() ?? 'U';

  return (
    <PageShell>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('profile.title')}</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-white/50">{t('profile.subtitle')}</p>
      </div>

      <div className="max-w-xl space-y-6">

        {/* ── Profile information card ─────────────────────────── */}
        <form onSubmit={handleProfileSubmit} className="rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 p-8 shadow-sm">
          <div className="mb-6 flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-orange-500 text-2xl font-bold text-white">
              {initial}
            </div>
            <div>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">{user?.name}</p>
              <p className="text-sm text-gray-500 dark:text-white/50">{user?.email}</p>
            </div>
          </div>

          {profileMsg && (
            <p className={`mb-4 rounded-lg px-4 py-3 text-sm ${profileMsg.type === 'success' ? 'bg-green-50 dark:bg-emerald-500/15 text-green-700 dark:text-emerald-300' : 'bg-red-50 dark:bg-rose-500/15 text-red-600 dark:text-rose-300'}`}>
              {profileMsg.text}
            </p>
          )}

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-white/80">{t('profile.nameLabel')}</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={inputClass(false)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-white/80">{t('profile.certificationLabel')}</label>
              <input
                type="text"
                value={certification}
                onChange={(e) => setCertification(e.target.value)}
                placeholder="AWS SAA, AZ-900…"
                className={inputClass(false)}
              />
            </div>
            <div className="flex justify-end">
              <Button
                label={isSavingProfile ? t('common.saving') : t('profile.saveButton')}
                disabled={isSavingProfile}
                type="submit"
              />
            </div>
          </div>
        </form>

        {/* ── Change password card ─────────────────────────────── */}
        <form onSubmit={handlePasswordSubmit} className="rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 p-8 shadow-sm">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('profile.changePassword.title')}</h2>
            <p className="mt-0.5 text-sm text-gray-500 dark:text-white/50">{t('profile.changePassword.subtitle')}</p>
          </div>

          {pwMsg && (
            <p className={`mb-4 rounded-lg px-4 py-3 text-sm ${pwMsg.type === 'success' ? 'bg-green-50 dark:bg-emerald-500/15 text-green-700 dark:text-emerald-300' : 'bg-red-50 dark:bg-rose-500/15 text-red-600 dark:text-rose-300'}`}>
              {pwMsg.text}
            </p>
          )}

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-white/80">
                {t('profile.changePassword.currentPassword')}
              </label>
              <input
                type="password"
                value={currentPw}
                onChange={(e) => setCurrentPw(e.target.value)}
                placeholder="••••••••"
                required
                className={inputClass(false)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-white/80">
                {t('profile.changePassword.newPassword')}
              </label>
              <input
                type="password"
                value={newPw}
                onChange={(e) => { setNewPw(e.target.value); setPwErrors((p) => ({ ...p, newPw: '' })); }}
                placeholder="••••••••"
                required
                className={inputClass(!!pwErrors.newPw)}
              />
              {pwErrors.newPw && <p className="mt-1 text-xs text-red-600">{pwErrors.newPw}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-white/80">
                {t('profile.changePassword.confirmNewPassword')}
              </label>
              <input
                type="password"
                value={confirmPw}
                onChange={(e) => { setConfirmPw(e.target.value); setPwErrors((p) => ({ ...p, confirmPw: '' })); }}
                placeholder="••••••••"
                required
                className={inputClass(!!pwErrors.confirmPw)}
              />
              {pwErrors.confirmPw && <p className="mt-1 text-xs text-red-600">{pwErrors.confirmPw}</p>}
            </div>

            <div className="flex justify-end">
              <Button
                label={isSavingPw ? t('common.saving') : t('profile.changePassword.saveButton')}
                disabled={isSavingPw}
                type="submit"
              />
            </div>
          </div>
        </form>

      </div>
    </PageShell>
  );
};

export default Profile;
