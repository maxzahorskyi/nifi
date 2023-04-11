import { gql } from '@apollo/client';
import { col1Fragment } from '../fragments/col1';

export const getCol1s = gql`
  query ($query: Col1QueryInput) {
    col1s(query: $query) {
      ...Col1Fragment
    }
  }
  ${col1Fragment}
`;

export const getCol1 = gql`
  query ($query: Col1QueryInput) {
    col1(query: $query) {
      ...Col1Fragment
    }
  }
  ${col1Fragment}
`;
