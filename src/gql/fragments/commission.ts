import { gql } from '@apollo/client';

export const commissionFragment = gql`
  fragment CommissionFragment on Commission {
    _id
    commissionId
    description
    type
    value
    blockchain
  }
`;
