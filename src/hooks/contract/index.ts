import { GQLContract } from '../../types/graphql.schema';
import { ApolloError, useQuery } from '@apollo/client';
import { getContract, getContracts } from '../../gql/query/contract';

export const useContract = (params?: {
  skipQuery: boolean;
  variables: Record<any, any>;
  pollInterval?: number;
  onSuccess: (data: { contract: GQLContract }) => void;
  onError: (e: ApolloError) => void;
}) => {
  const { data, loading, error, fetchMore } = useQuery<{ contract: GQLContract }>(getContract, {
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

export const useContracts = (params?: {
  skipQuery: boolean;
  variables: Record<any, any>;
  pollInterval?: number;
  onSuccess: (data: { contracts: GQLContract[] }) => void;
  onError: (e: ApolloError) => void;
}) => {
  const { data, loading, error, fetchMore } = useQuery<{ contracts: GQLContract[] }>(getContracts, {
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
