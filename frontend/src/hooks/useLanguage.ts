import { useTranslation } from 'react-i18next';

const useLanguage = () => {
  const { i18n } = useTranslation();

  const currentLanguage = i18n.language;
  const toggleLanguage = () => {
    i18n.changeLanguage(currentLanguage === 'ja' ? 'en' : 'ja');
  };

  return { currentLanguage, toggleLanguage };
};

export default useLanguage;
