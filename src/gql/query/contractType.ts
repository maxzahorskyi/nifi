import { gql } from '@apollo/client';
import { contractTypeFragment } from '../fragments/contractType';

export const getContractType = gql`
  query ($query: Contract_typeQueryInput) {
    contract_type(query: $query) {
      ...ContractTypeFragment
    }
  }
  ${contractTypeFragment}
`;

export const getContractTypes = gql`
  query ($query: Contract_typeQueryInput) {
    contract_types(query: $query) {
      ...ContractTypeFragment
    }
  }
  ${contractTypeFragment}
`;
