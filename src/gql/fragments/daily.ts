import { gql } from '@apollo/client';

export const dailyFragment = gql`
  fragment DailyFragment on Daily {
    _id
    createdAt
    date
    saleAverage
    saleMax
    saleMin
    tokensCreated
    tokensSold
    updatedAt
  }
`;
