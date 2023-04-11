import { gql } from '@apollo/client';
import { addressAbiFragment } from '../fragments/addressAbi';

export const getAddressAbi = gql`
  query ($query: Address_abiQueryInput) {
    address_abi(query: $query) {
      ...AddressAbiFragment
    }
  }
  ${addressAbiFragment}
`;
