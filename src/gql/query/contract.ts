import { gql } from '@apollo/client';
import { contractFragment } from '../fragments/contract';

export const getContract = gql`
  query ($name: String, $status: String) {
    contract(query: { longType: $name, status: $status }) {
      ...ContractFragment
    }
  }
  ${contractFragment}
`;

export const getContracts = gql`
  query ($name: String, $status: String) {
    contracts(query: { longType: $name, status: $status }) {
      ...ContractFragment
    }
  }
  ${contractFragment}
`;

export const getContractsSort = gql`
  query ($query: ContractQueryInput, $sortBy: ContractSortByInput) {
    contracts(query: $query, sortBy: $sortBy) {
      ...ContractFragment
    }
  }
  ${contractFragment}
`;
