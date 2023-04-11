import 'react-i18next';
import en from '../src/config/i18n/locales/en.json'

declare module 'react-i18next' {
  interface Resources {
    translations: typeof en;
  }
}
