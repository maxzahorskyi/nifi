import { gql } from '@apollo/client';
import { userFragment } from '../fragments/user';

export const getUsers = gql`
  query ($query: UserQueryInput) {
    users(query: $query) {
      ...UserFragment
    }
  }
  ${userFragment}
`;

export const getUser = gql`
  query ($query: UserQueryInput) {
    user(query: $query) {
      ...UserFragment
    }
  }
  ${userFragment}
`;
