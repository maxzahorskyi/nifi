import { gql } from '@apollo/client';

export const addressAbiFragment = gql`
  fragment AddressAbiFragment on Address_abi {
    _id
    address
    level
    superType
  }
`;
