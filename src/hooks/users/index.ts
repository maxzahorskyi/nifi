import { GQLUser } from '../../types/graphql.schema';
import { ApolloError, useQuery } from '@apollo/client';
import { getUser, getUsers } from '../../gql/query/user';

export const useUser = (params?: {
  skipQuery: boolean;
  variables: Record<any, any>;
  pollInterval?: number;
  onSuccess: (data: { user: GQLUser | undefined }) => void;
  onError: (e: ApolloError) => void;
}) => {
  const { data, loading, error, fetchMore } = useQuery<{ user: GQLUser }>(getUser, {
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

export const useUsers = (params?: {
  skipQuery: boolean;
  variables: Record<any, any>;
  pollInterval?: number;
  onSuccess: (data: { users: GQLUser[] }) => void;
  onError: (e: ApolloError) => void;
}) => {
  const { data, loading } = useQuery<{ users: GQLUser[] }>(getUsers, {
    errorPolicy: 'ignore',
    skip: params?.skipQuery,
    variables: params?.variables,
    notifyOnNetworkStatusChange: true,
    pollInterval: params?.pollInterval,
    onCompleted: params?.onSuccess,
    onError: params?.onError,
  });

  return { data, loading };
};
