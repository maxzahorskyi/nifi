import { useQuery as useGqlQuery, ApolloError, WatchQueryFetchPolicy } from '@apollo/client';
import { GQLCollection } from '../../types/graphql.schema';

import {
  getCollection,
  getCollectionCount,
  getCollections,
  getPaginationCollections,
} from '../../gql/query/collection';
import { useRouter } from 'next/router';

export const useCollection = (params: {
  skipQuery: boolean;
  variables: Record<string, any>;
  pollInterval?: number;
  fetchPolicy?: WatchQueryFetchPolicy;
  onSuccess: (collection: GQLCollection) => void;
  onError: (e: ApolloError) => void;
}) => {
  const { skipQuery, variables, pollInterval, onSuccess, onError, fetchPolicy } = params;
  const router = useRouter();
  useGqlQuery<{ collection: GQLCollection }>(getCollection, {
    errorPolicy: 'ignore',
    skip: skipQuery,
    variables,
    fetchPolicy,
    notifyOnNetworkStatusChange: true,
    pollInterval,
    onCompleted: (data) => {
      if (data?.collection) {
        onSuccess(data?.collection);
      } else {
        router.push('/404');
      }
    },
    onError,
  });
};

export const useCollections = (params: {
  skipQuery: boolean;
  variables: Record<string, any>;
  pollInterval?: number;
  onSuccess: (collection: GQLCollection[]) => void;
  onError: (e: ApolloError) => void;
}) => {
  const { skipQuery, variables, pollInterval, onSuccess, onError } = params;
  useGqlQuery<{ collections: GQLCollection[] }>(getCollections, {
    errorPolicy: 'ignore',
    skip: skipQuery,
    variables,
    notifyOnNetworkStatusChange: true,
    pollInterval,
    onCompleted: (data) => {
      if (data?.collections) {
        onSuccess(data?.collections);
      }
    },
    onError,
  });
};

export const usePaginationCollections = (params: {
  skipQuery: boolean;
  variables: Record<string, any>;
  pollInterval?: number;
  onSuccess: (paginationCollection: GQLCollection[]) => void;
  onError: (e: ApolloError) => void;
}) => {
  const { skipQuery, variables, pollInterval, onSuccess, onError } = params;
  const { loading, data } = useGqlQuery<{ paginationCollection: GQLCollection[] }>(
    getPaginationCollections,
    {
      errorPolicy: 'ignore',
      skip: skipQuery,
      variables,
      notifyOnNetworkStatusChange: true,
      pollInterval,
      onCompleted: (data) => {
        if (data?.paginationCollection) {
          onSuccess(data?.paginationCollection);
        }
      },
      onError,
    },
  );

  const { loading: loadingCount, data: count } = useGqlQuery<{ collectionCount: number }>(
    getCollectionCount,
    {
      errorPolicy: 'ignore',
      skip: skipQuery,
      variables: {
        creator: variables?.query?.creator,
        search: variables?.query?.search,
        created_lt: variables?.query?.created_lt,
      },
      notifyOnNetworkStatusChange: true,
      onCompleted: (data) => {},
      pollInterval,
      onError,
    },
  );

  return { loading: loadingCount || loading, count: count?.collectionCount, data };
};
