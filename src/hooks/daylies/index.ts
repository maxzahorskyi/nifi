import { GQLDaily } from '../../types/graphql.schema';
import { ApolloError, useQuery } from '@apollo/client';
import { getDailies, getDaily } from '../../gql/query/daily';

export const useDaily = (params?: {
  skipQuery: boolean;
  variables: Record<any, any>;
  pollInterval?: number;
  onSuccess: (data: { daily: GQLDaily }) => void;
  onError: (e: ApolloError) => void;
}) => {
  const { data, loading, error, fetchMore } = useQuery<{ daily: GQLDaily }>(getDaily, {
    errorPolicy: 'ignore',
    skip: params?.skipQuery,
    variables: params?.variables,
    notifyOnNetworkStatusChange: true,
    pollInterval: params?.pollInterval,
    onCompleted: params?.onSuccess,
    onError: params?.onError,
  });

  return { data, loading, error, fetchMore };
};

export const useDailies = (params?: {
  skipQuery: boolean;
  variables: Record<any, any>;
  pollInterval?: number;
  onSuccess: (data: { dailies: GQLDaily[] }) => void;
  onError: (e: ApolloError) => void;
}) => {
  const { data, loading, error, fetchMore } = useQuery<{ dailies: GQLDaily[] }>(getDailies, {
    errorPolicy: 'ignore',
    skip: params?.skipQuery,
    variables: params?.variables,
    notifyOnNetworkStatusChange: true,
    pollInterval: params?.pollInterval,
    onCompleted: params?.onSuccess,
    onError: params?.onError,
  });

  return { data, loading, error, fetchMore };
};
