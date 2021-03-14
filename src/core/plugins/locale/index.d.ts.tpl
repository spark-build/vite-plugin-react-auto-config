import 'react-i18next';
import { resources } from '{{{ initReactI18nextPath }}}';

declare module 'react-i18next' {
  type DefaultResources = typeof resources['{{{ defaultLocal }}}'];
  interface Resources extends DefaultResources {}
}
