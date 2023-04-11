// eslint-disable-next-line camelcase
import { GQLSession } from '../../types/graphql.schema';
import { ApolloError, useQuery } from '@apollo/client';
import { getSession, getSessions } from '../../gql/query/session';

export const useSession = (params?: {
  skipQuery: boolean;
  variables: Record<any, any>;
  pollInterval?: number;
  // eslint-disable-next-line camelcase
  onCompleted: (data: { getSession: GQLSession }) => void;
  onError: (e: ApolloError) => void;
}) => {
  // eslint-disable-next-line camelcase
  const { data, loading } = useQuery<{ getSession: GQLSession }>(getSession, {
    errorPolicy: 'ignore',
    skip: params?.skipQuery,
    variables: params?.variables,
    notifyOnNetworkStatusChange: true,
    pollInterval: params?.pollInterval,
    onCompleted: params?.onCompleted,
    onError: params?.onError,
  });

  return { data, loading };
};

export const useSessions = (params?: {
  skipQuery: boolean;
  variables: Record<any, any>;
  pollInterval?: number;
  // eslint-disable-next-line camelcase
  onCompleted: (data: { getSessions: GQLSession[] }) => void;
  onError: (e: ApolloError) => void;
}) => {
  // eslint-disable-next-line camelcase
  const { data, loading } = useQuery<{ getSessions: GQLSession[] }>(getSessions, {
    errorPolicy: 'ignore',
    skip: params?.skipQuery,
    variables: params?.variables,
    notifyOnNetworkStatusChange: true,
    pollInterval: params?.pollInterval,
    onCompleted: params?.onCompleted,
    onError: params?.onError,
  });

  return { data, loading };
};
