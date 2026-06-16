import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, Navigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { register } from '@/services/authService';
import { useAuthStore } from '@/store/authStore';

const ALLOWED_DOMAIN = '@gicjp.com';

const Register = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { token, user, setAuth } = useAuthStore();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  if (token && user) {
    return <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/exam/select'} replace />;
  }

  const validate = (): boolean => {
    const errors: Record<string, string> = {};

    if (!name.trim()) {
      errors.name = t('common.error');
    }

    if (!email.toLowerCase().endsWith(ALLOWED_DOMAIN)) {
      errors.email = t('auth.emailDomainError');
    }

    if (password.length < 8) {
      errors.password = t('auth.passwordTooShort');
    }

    if (password !== confirmPassword) {
      errors.confirmPassword = t('auth.passwordMismatch');
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError('');
    if (!validate()) return;

    setLoading(true);
    try {
      const { token: newToken, user: newUser } = await register(name, email, password, confirmPassword);
      setAuth(newUser, newToken);
      navigate('/exam/select', { replace: true });
    } catch {
      setServerError(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (field: string) =>
    `mt-1 block w-full rounded-lg border px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 ${
      fieldErrors[field]
        ? 'border-red-400 focus:border-red-500 focus:ring-red-500'
        : 'border-gray-300 focus:border-amber-500 focus:ring-amber-500'
    }`;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link to="/" className="text-3xl font-bold text-amber-600">
            {t('app.title')}
          </Link>
          <p className="mt-2 text-sm text-gray-500">{t('app.subtitle')}</p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
          <h2 className="mb-6 text-xl font-semibold text-gray-900">{t('auth.register')}</h2>

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                {t('auth.name')}
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => { setName(e.target.value); setFieldErrors((p) => ({ ...p, name: '' })); }}
                placeholder={t('auth.namePlaceholder')}
                required
                className={inputClass('name')}
              />
              {fieldErrors.name && <p className="mt-1 text-xs text-red-600">{fieldErrors.name}</p>}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                {t('auth.email')}
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setFieldErrors((p) => ({ ...p, email: '' })); }}
                placeholder={`yourname${ALLOWED_DOMAIN}`}
                required
                className={inputClass('email')}
              />
              {fieldErrors.email
                ? <p className="mt-1 text-xs text-red-600">{fieldErrors.email}</p>
                : <p className="mt-1 text-xs text-gray-400">{ALLOWED_DOMAIN} {t('auth.emailDomainError').split('@gicjp.com')[1] || ''}</p>
              }
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                {t('auth.password')}
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setFieldErrors((p) => ({ ...p, password: '' })); }}
                placeholder="••••••••"
                required
                className={inputClass('password')}
              />
              {fieldErrors.password && <p className="mt-1 text-xs text-red-600">{fieldErrors.password}</p>}
            </div>

            {/* Confirm password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                {t('auth.confirmPassword')}
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => { setConfirmPassword(e.target.value); setFieldErrors((p) => ({ ...p, confirmPassword: '' })); }}
                placeholder="••••••••"
                required
                className={inputClass('confirmPassword')}
              />
              {fieldErrors.confirmPassword && (
                <p className="mt-1 text-xs text-red-600">{fieldErrors.confirmPassword}</p>
              )}
            </div>

            {serverError && <p className="text-sm text-red-600">{serverError}</p>}

            <Button
              label={loading ? t('auth.registering') : t('auth.registerButton')}
              type="submit"
              disabled={loading}
              className="w-full py-2.5"
            />
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            {t('auth.alreadyHaveAccount')}{' '}
            <Link to="/login" className="font-medium text-amber-600 hover:underline">
              {t('auth.login')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
