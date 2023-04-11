import { GQLBid } from '../../types/graphql.schema';
import { ApolloError, useQuery } from '@apollo/client';
import { getBid, getBids } from '../../gql/query/bid';

export const useBid = (params: {
  skipQuery: boolean;
  variables: Record<string, any>;
  pollInterval?: number;
  onSuccess: (bid: GQLBid) => void;
  onError: (e: ApolloError) => void;
}) => {
  const { skipQuery, variables, pollInterval, onSuccess, onError } = params;
  useQuery<{ bid: GQLBid }>(getBid, {
    errorPolicy: 'ignore',
    skip: skipQuery,
    variables,
    notifyOnNetworkStatusChange: true,
    pollInterval,
    onCompleted: (data) => {
      if (data?.bid) {
        onSuccess(data?.bid);
      }
    },
    onError,
  });
};

export const useBids = (params: {
  skipQuery: boolean;
  variables: Record<string, any>;
  pollInterval?: number;
  onSuccess: (series: GQLBid[]) => void;
  onError: (e: ApolloError) => void;
}) => {
  const { skipQuery, variables, pollInterval, onSuccess, onError } = params;
  useQuery<{ bids: GQLBid[] }>(getBids, {
    errorPolicy: 'ignore',
    skip: skipQuery,
    variables,
    notifyOnNetworkStatusChange: true,
    pollInterval,
    onCompleted: (data) => {
      if (data?.bids) {
        onSuccess(data?.bids);
      }
    },
    onError,
  });
};
