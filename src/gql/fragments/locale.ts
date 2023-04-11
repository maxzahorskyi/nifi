import { gql } from '@apollo/client';
import { moduleFragment } from './module';

export const localeFragment = gql`
  fragment LocaleFragment on Locale {
    _id
    lang
    module {
      ...ModuleFragment
    }
    string
    stringName
  }
  ${moduleFragment}
`;
