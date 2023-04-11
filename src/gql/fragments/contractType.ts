import { gql } from '@apollo/client';

export const contractTypeFragment = gql`
  fragment ContractTypeFragment on Contract_type {
    _id
    frontendName
    longType
    applicableBlockchains
    abi {
      root
      series
      token
      trx
    }
    status
  }
`;

