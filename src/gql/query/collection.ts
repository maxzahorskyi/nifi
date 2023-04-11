import { gql } from '@apollo/client';
import { collectionFragment } from '../fragments/collection';

export const getCollections = gql`
  query ($query: CollectionQueryInput, $sortBy: CollectionSortByInput) {
    collections(query: $query, sortBy: $sortBy) {
      ...CollectionFragment
    }
  }
  ${collectionFragment}
`;

export const getCollection = gql`
  query ($query: CollectionQueryInput) {
    collection(query: $query) {
      ...CollectionFragment
    }
  }
  ${collectionFragment}
`;

export const getPaginationCollections = gql`
  query ($query: PaginationCollection) {
    paginationCollection(input: $query) {
      ...CollectionFragment
    }
  }
  ${collectionFragment}
`;

export const getCollectionCount = gql`
  query ($creator: String, $search: String, $created_lt: Float) {
    collectionCount(input: { creator: $creator, search: $search, created_lt: $created_lt })
  }
`;
