import i18n from 'i18next';

import { initReactI18next } from 'react-i18next';

import enUS from '@/locales/en-US';
import zhCN from '@/locales/zh-CN';

export const resources = {
  'en-US': {
    translation: enUS,
  },
  'zh-CN': {
    translation: zhCN,
  },
} as const;

export const i18nInstance = i18n.use(initReactI18next).init({
  // ns: ['translations'],
  // defaultNS: 'translations',
  lng: 'zh-CN',
  resources,
  keySeparator: false,
  interpolation: {
    escapeValue: false,
  },
});
