import { getToken, getTokenCount, getTokenPagination, getTokens } from '../../gql/query/token';
import { GQLToken, GQLTokenPagination } from '../../types/graphql.schema';
import { ApolloError, useQuery } from '@apollo/client';

export const useTokenPagination = (params: {
  skipQuery: boolean;
  variables: GQLTokenPagination;
  pollInterval?: number;
  onSuccess: (tokenPagination: GQLToken[] | undefined) => void;
  onError: (e: ApolloError) => void;
}) => {
  const { skipQuery, variables, pollInterval, onSuccess, onError } = params;
  const { loading, data } = useQuery<{ tokenPagination: GQLToken[] }>(getTokenPagination, {
    errorPolicy: 'ignore',
    skip: skipQuery,
    variables,
    notifyOnNetworkStatusChange: true,
    pollInterval,
    onCompleted: (data) =>
      onSuccess(data?.tokenPagination.length > 0 ? data?.tokenPagination : undefined),
    onError,
  });
  const { loading: loadingCount, data: count } = useQuery<{ tokenCount: number }>(getTokenCount, {
    errorPolicy: 'ignore',
    skip: skipQuery,
    variables,
    notifyOnNetworkStatusChange: true,
    pollInterval,
    onError,
  });
  return { loading: loadingCount || loading, data, count: count?.tokenCount };
};

export const useToken = (params: {
  skipQuery: boolean;
  variables: Record<string, any>;
  pollInterval?: number;
  onSuccess: (token: GQLToken | undefined) => void;
  onError: (e: ApolloError) => void;
}) => {
  const { skipQuery, variables, pollInterval, onSuccess, onError } = params;
  useQuery<{ token: GQLToken }>(getToken, {
    errorPolicy: 'ignore',
    skip: skipQuery,
    variables,
    notifyOnNetworkStatusChange: true,
    pollInterval,
    onCompleted: (data) => onSuccess(data?.token),
    onError,
  });
};

export const useTokens = (params: {
  skipQuery: boolean;
  variables: Record<string, any>;
  pollInterval?: number;
  onSuccess: (tokens: GQLToken[]) => void;
  onError: (e: ApolloError) => void;
}) => {
  const { skipQuery, variables, pollInterval, onSuccess, onError } = params;
  useQuery<{ tokens: GQLToken[] }>(getTokens, {
    errorPolicy: 'ignore',
    skip: skipQuery,
    variables,
    notifyOnNetworkStatusChange: true,
    pollInterval,
    onCompleted: (data) => onSuccess(data?.tokens),
    onError,
  });
};
