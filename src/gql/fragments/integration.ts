import { gql } from '@apollo/client';

export const integrationFragment = gql`
  fragment IntegrationFragment on Integration {
    _id
    code
    name
    subType
    type
    blockchain
    status
  }
`;
