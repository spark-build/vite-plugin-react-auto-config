import i18n from 'i18next';

import { initReactI18next } from 'react-i18next';

{{{ imports }}}
export const resources = {
{{{ resources }}}
} as const;

export const i18nInstance = i18n.use(initReactI18next).init({
  // ns: ['translations'],
  // defaultNS: 'translations',
  {{ #default }}
  lng: '{{{ default }}}',
  {{ /default }}
  resources,
  keySeparator: false,
  interpolation: {
    escapeValue: false,
  },
});
