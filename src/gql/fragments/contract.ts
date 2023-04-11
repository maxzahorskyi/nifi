import { gql } from '@apollo/client';

export const contractFragment = gql`
  fragment ContractFragment on Contract {
    _id
    address
    environment
    longType
    network
    superType
    abiPath
    blockchain
    abiFile
  }
`;

