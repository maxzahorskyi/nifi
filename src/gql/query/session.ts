import { gql } from '@apollo/client';
import { sessionFragment } from '../fragments/session';

export const getSession = gql`
  query ($input: GetSession) {
    getSession(input: $input) {
      ...SessionFragment
    }
  }
  ${sessionFragment}
`;

export const getSessions = gql`
  query ($input: GetSessionsIn) {
    getSessions(input: $input) {
      ...SessionFragment
    }
  }
  ${sessionFragment}
`;
