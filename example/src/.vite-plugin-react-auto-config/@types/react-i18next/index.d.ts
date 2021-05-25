import 'react-i18next';
import { resources } from '@@/initReactI18next.ts';

declare module 'react-i18next' {
  type DefaultResources = typeof resources[''];
  interface Resources extends DefaultResources {}
}
