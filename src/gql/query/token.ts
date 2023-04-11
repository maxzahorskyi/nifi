import { gql } from '@apollo/client';
import { tokenFragment } from '../fragments/token';

export const getTokens = gql`
  query ($query: TokenQueryInput) {
    tokens(query: $query) {
      ...TokenFragment
    }
  }
  ${tokenFragment}
`;

export const getToken = gql`
  query ($query: TokenQueryInput) {
    token(query: $query) {
      ...TokenFragment
    }
  }
  ${tokenFragment}
`;

export const getTokenPagination = gql`
  query (
    $isLiveBid: Boolean
    $isOnSale: Boolean
    $search: String
    $limit: Float
    $skip: Float
    $type: String
    $sort: TokenPaginationSort
    $owner: String
    $creator: String
    $created_lt: Float
    $qualification_gte: Float
    $collectionID: String
  ) {
    tokenPagination(
      input: {
        isLiveBid: $isLiveBid
        isOnSale: $isOnSale
        type: $type
        search: $search
        limit: $limit
        skip: $skip
        sort: $sort
        owner: $owner
        creator: $creator
        created_lt: $created_lt
        qualification_gte: $qualification_gte
        collectionID: $collectionID
      }
    ) {
      ...TokenFragment
    }
  }
  ${tokenFragment}
`;

export const getTokensProps = gql`
  query ($type: String) {
    distinctTokensProps(input: { type: $type })
  }
`;

export const getTokenCount = gql`
  query (
    $qualification_gte: Float
    $isLiveBid: Boolean
    $isOnSale: Boolean
    $type: String
    $owner: String
    $creator: String
    $search: String
    $created_lt: Float
    $collectionID: String
  ) {
    tokenCount(
      input: {
        isLiveBid: $isLiveBid
        isOnSale: $isOnSale
        type: $type
        owner: $owner
        creator: $creator
        search: $search
        created_lt: $created_lt
        qualification_gte: $qualification_gte
        collectionID: $collectionID
      }
    )
  }
`;
