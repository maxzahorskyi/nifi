import { gql } from '@apollo/client';
import { seriesFragment } from '../fragments/series';

export const getSeries = gql`
  query ($query: SeriesQueryInput) {
    series(query: $query) {
      ...SeriesFragment
    }
  }
  ${seriesFragment}
`;

export const getSeriess = gql`
  query ($query: SeriesQueryInput) {
    seriess(query: $query) {
      ...SeriesFragment
    }
  }
  ${seriesFragment}
`;

export const getSeriesPagination = gql`
  query (
    $search: String
    $limit: Float
    $skip: Float
    $sort: SeriesPaginationSort
    $creator: String
    $created_lt: Float
  ) {
    seriesPagination(
      input: {
        search: $search
        limit: $limit
        skip: $skip
        sort: $sort
        creator: $creator
        created_lt: $created_lt
      }
    ) {
      ...SeriesFragment
    }
  }
  ${seriesFragment}
`;

export const getSeriesCount = gql`
  query ($creator: String, $created_lt: Float) {
    seriesCount(input: { creator: $creator, created_lt: $created_lt })
  }
`;
