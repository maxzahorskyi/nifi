import { gql } from '@apollo/client';
import { tokenColFragment } from '../fragments/tokenCol';

export const getTokenCols = gql`
  query ($query: TokenColQueryInput) {
    tokenCols(query: $query) {
      ...TokenColFragment
    }
  }
  ${tokenColFragment}
`;

export const getTokenCol = gql`
  query ($query: TokenColQueryInput) {
    tokenCol(query: $query) {
      ...TokenColFragment
    }
  }
  ${tokenColFragment}
`;
