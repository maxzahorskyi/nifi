import { gql } from '@apollo/client';
import { formatFragment } from '../fragments/format';

export const getFormats = gql`
  query {
    formats {
      ...formatFragment
    }
  }
  ${formatFragment}
`;

export const getFormat = gql`
  query ($query: FormatQueryInput) {
    format(query: $query) {
      ...formatFragment
    }
  }
  ${formatFragment}
`;
