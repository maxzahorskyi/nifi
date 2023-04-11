import { gql } from '@apollo/client';
import { dailyFragment } from '../fragments/daily';

export const getDaily = gql`
  query ($query: DailyQueryInput) {
    daily(query: $query) {
      ...DailyFragment
    }
  }
  ${dailyFragment}
`;

export const getDailies = gql`
  query ($query: DailyQueryInput, $sortBy: DailySortByInput) {
    dailies(query: $query, sortBy: $sortBy) {
      ...DailyFragment
    }
  }
  ${dailyFragment}
`;
