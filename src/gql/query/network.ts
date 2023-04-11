import { gql } from '@apollo/client';
import { networkFragment } from '../fragments/network';

export const getNetworks = gql`
  query {
    networks {
      ...NetworkFragment
    }
  }
  ${networkFragment}
`;
