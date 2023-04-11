import { gql } from '@apollo/client';
import { userFragment } from './user';

export const sessionFragment = gql`
  fragment SessionFragment on Session {
    _id
    address
    swiftMessageTime
    confirmationHash
    cookiesHash
    isExpired
    accountNumberObject {
      ...UserFragment
    }
  }
  ${userFragment}
`;
