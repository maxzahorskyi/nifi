import { GQLAuction } from '../../types/graphql.schema';
import { ApolloError, useQuery } from '@apollo/client';
import { getAuction, getAuctions } from '../../gql/query/auction';

export const useAuction = (params: {
  skipQuery: boolean;
  variables: Record<string, any>;
  pollInterval?: number;
  onSuccess: (auction: GQLAuction) => void;
  onError: (e: ApolloError) => void;
}) => {
  const { skipQuery, variables, pollInterval, onSuccess, onError } = params;
  useQuery<{ auction: GQLAuction }>(getAuction, {
    errorPolicy: 'ignore',
    skip: skipQuery,
    variables,
    notifyOnNetworkStatusChange: true,
    pollInterval,
    onCompleted: (data) => {
      if (data?.auction) {
        onSuccess(data?.auction);
      }
    },
    onError,
  });
};

export const useAuctions = (params: {
  skipQuery: boolean;
  variables: Record<string, any>;
  pollInterval?: number;
  onSuccess: (series: GQLAuction[]) => void;
  onError: (e: ApolloError) => void;
}) => {
  const { skipQuery, variables, pollInterval, onSuccess, onError } = params;
  useQuery<{ auctions: GQLAuction[] }>(getAuctions, {
    errorPolicy: 'ignore',
    skip: skipQuery,
    variables,
    notifyOnNetworkStatusChange: true,
    pollInterval,
    onCompleted: (data) => {
      if (data?.auctions) {
        onSuccess(data?.auctions);
      }
    },
    onError,
  });
};
