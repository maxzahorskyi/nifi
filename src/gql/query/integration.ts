import { gql } from '@apollo/client';
import { integrationFragment } from '../fragments/integration';

export const getIntegrations = gql`
  query {
    integrations {
      ...IntegrationFragment
    }
  }
  ${integrationFragment}
`;

export const getIntegration = gql`
  query ($query: IntegrationQueryInput) {
    integration(query: $query) {
      ...IntegrationFragment
    }
  }
  ${integrationFragment}
`;
