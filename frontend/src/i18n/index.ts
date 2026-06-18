import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import ja from './ja.json';
import en from './en.json';
import { I18N_STORAGE_KEY, DEFAULT_LOCALE } from '@/constants';

i18n.use(initReactI18next).init({
  resources: {
    ja: { translation: ja },
    en: { translation: en },
  },
  lng: localStorage.getItem(I18N_STORAGE_KEY) ?? DEFAULT_LOCALE,
  fallbackLng: DEFAULT_LOCALE,
  interpolation: { escapeValue: false },
});

export default i18n;
