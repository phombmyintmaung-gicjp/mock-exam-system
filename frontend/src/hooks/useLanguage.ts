import { useTranslation } from 'react-i18next';

const useLanguage = () => {
  const { i18n } = useTranslation();

  const currentLanguage = i18n.language;
  const toggleLanguage = () => {
    const next = currentLanguage === 'ja' ? 'en' : 'ja';
    i18n.changeLanguage(next);
    localStorage.setItem('i18n-lang', next);
  };

  return { currentLanguage, toggleLanguage };
};

export default useLanguage;
