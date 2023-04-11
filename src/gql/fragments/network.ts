import { gql } from '@apollo/client';

export const networkFragment = gql`
  fragment NetworkFragment on Network {
    _id
    name
    integration
    type
  }
`;
