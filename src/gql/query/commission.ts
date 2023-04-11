import { gql } from '@apollo/client';
import { commissionFragment } from '../fragments/commission';

export const getCommissions = gql`
  query {
    commissions {
      ...CommissionFragment
    }
  }
  ${commissionFragment}
`;
