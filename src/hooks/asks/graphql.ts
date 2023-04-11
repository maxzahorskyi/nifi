import { GQLAsk } from '../../types/graphql.schema';
import { ApolloError, useQuery } from '@apollo/client';
import { getAsk, getAsks } from '../../gql/query/ask';

export const useAsk = (params: {
  skipQuery: boolean;
  variables: Record<string, any>;
  pollInterval?: number;
  onSuccess: (ask: GQLAsk | undefined) => void;
  onError: (e: ApolloError) => void;
}) => {
  const { skipQuery, variables, pollInterval, onSuccess, onError } = params;
  useQuery<{ ask?: GQLAsk }>(getAsk, {
    errorPolicy: 'ignore',
    skip: skipQuery,
    variables,
    notifyOnNetworkStatusChange: true,
    pollInterval,
    onCompleted: (data) => {
      onSuccess(data?.ask);
    },
    onError,
  });
};

export const useAsks = (params: {
  skipQuery: boolean;
  variables: Record<string, any>;
  pollInterval?: number;
  onSuccess: (ask: GQLAsk[]) => void;
  onError: (e: ApolloError) => void;
}) => {
  const { skipQuery, variables, pollInterval, onSuccess, onError } = params;
  useQuery<{ asks: GQLAsk[] }>(getAsks, {
    errorPolicy: 'ignore',
    skip: skipQuery,
    variables,
    notifyOnNetworkStatusChange: true,
    pollInterval,
    onCompleted: (data) => {
      if (data?.asks) {
        onSuccess(data?.asks);
      }
    },
    onError,
  });
};
