// eslint-disable-next-line camelcase
import { GQLContract_type } from '../../types/graphql.schema';
import { ApolloError, useQuery } from '@apollo/client';
import { getContractType, getContractTypes } from '../../gql/query/contractType';

export const useContractType = (params?: {
  skipQuery: boolean;
  variables: Record<any, any>;
  pollInterval?: number;
  // eslint-disable-next-line camelcase
  onSuccess: (data: { contract_type: GQLContract_type }) => void;
  onError: (e: ApolloError) => void;
}) => {
  // eslint-disable-next-line camelcase
  const { data, loading, error, fetchMore } = useQuery<{
    contract_type: GQLContract_type;
  }>(getContractType, {
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

export const useContractTypes = (params?: {
  skipQuery: boolean;
  variables: Record<any, any>;
  pollInterval?: number;
  // eslint-disable-next-line camelcase
  onSuccess: (data: { contract_types: GQLContract_type[] }) => void;
  onError: (e: ApolloError) => void;
}) => {
  // eslint-disable-next-line camelcase
  const { data, loading, error, fetchMore } = useQuery<{
    contract_types: GQLContract_type[];
  }>(getContractTypes, {
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
