import { useTranslation } from 'react-i18next';
import { I18N_STORAGE_KEY } from '@/constants';

const useLanguage = () => {
  const { i18n } = useTranslation();

  const currentLanguage = i18n.language;
  const toggleLanguage = () => {
    const next = currentLanguage === 'ja' ? 'en' : 'ja';
    i18n.changeLanguage(next);
    localStorage.setItem(I18N_STORAGE_KEY, next);
  };

  return { currentLanguage, toggleLanguage };
};

export default useLanguage;
