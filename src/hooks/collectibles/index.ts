import { ApolloError, useQuery } from '@apollo/client';
import { getCol1, getCol1s } from '../../gql/query/col1';
import { GQLCol1 } from '../../types/graphql.schema';

export const useCollectibles = (params?: {
  skipQuery: boolean;
  variables: Record<any, any>;
  poolInterval: number;
  onCompleted: (data: { col1: GQLCol1[] }) => void;
  onError: (e: ApolloError) => void;
}) => {
  const { data, loading } = useQuery<{ col1: GQLCol1[] }>(getCol1s, {
    errorPolicy: 'ignore',
    skip: params?.skipQuery,
    variables: params?.variables,
    pollInterval: params?.poolInterval,
    onCompleted: params?.onCompleted,
    onError: params?.onError,
  });

  return { data, loading };
};

export const useCollectible = (params?: {
  skipQuery?: boolean;
  variables?: Record<any, any>;
  poolInterval?: number;
  onCompleted?: (data: { col1: GQLCol1 }) => void;
  onError?: (e: ApolloError) => void;
}) => {
  const { data, loading } = useQuery<{ col1: GQLCol1 }>(getCol1, {
    errorPolicy: 'ignore',
    skip: params?.skipQuery,
    variables: params?.variables,
    pollInterval: params?.poolInterval,
    notifyOnNetworkStatusChange: true,
    onCompleted: params?.onCompleted,
    onError: params?.onError,
  });

  return { data, loading };
};
