import { gql } from '@apollo/client';
import { askFragment } from '../fragments/ask';

export const getAsks = gql`
  query ($query: AskQueryInput) {
    asks(query: $query) {
      ...AskFragment
    }
  }
  ${askFragment}
`;

export const getAsk = gql`
  query ($query: AskQueryInput) {
    ask(query: $query) {
      ...AskFragment
    }
  }
  ${askFragment}
`;

export const insertAsk = gql`
  mutation ($data: AskInsertInput!) {
    insertOneAsk(data: $data) {
      ...AskFragment
    }
  }
  ${askFragment}
`;
