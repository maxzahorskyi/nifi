import { gql } from '@apollo/client';
import { localeFragment } from '../fragments/locale';

export const getLocales = gql`
  query ($query: LocaleQueryInput) {
    locales(query: $query) {
      ...LocaleFragment
    }
  }
  ${localeFragment}
`;

export const getLocale = gql`
  query ($query: LocaleQueryInput) {
    locale(query: $query) {
      ...LocaleFragment
    }
  }
  ${localeFragment}
`;
