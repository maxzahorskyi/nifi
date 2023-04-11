import { GQLEndorsement } from '../../types/graphql.schema';
import { ApolloError, useQuery } from '@apollo/client';
import { getEndorsement, getEndorsements } from '../../gql/query/endorsement';

export const useEndorsement = (params: {
  skipQuery: boolean;
  variables: Record<string, any>;
  pollInterval?: number;
  onSuccess: (endorsement?: GQLEndorsement) => void;
  onError: (e: ApolloError) => void;
}) => {
  const { skipQuery, variables, pollInterval, onSuccess, onError } = params;
  useQuery<{ endorsement: GQLEndorsement }>(getEndorsement, {
    errorPolicy: 'ignore',
    skip: skipQuery,
    variables,
    notifyOnNetworkStatusChange: true,
    pollInterval,
    onCompleted: (data) => {
      onSuccess(data?.endorsement);
    },
    onError,
  });
};

export const useEndorsements = (params: {
  skipQuery: boolean;
  variables: Record<string, any>;
  pollInterval?: number;
  onSuccess: (ask: GQLEndorsement[]) => void;
  onError: (e: ApolloError) => void;
}) => {
  const { skipQuery, variables, pollInterval, onSuccess, onError } = params;
  useQuery<{ endorsements: GQLEndorsement[] }>(getEndorsements, {
    errorPolicy: 'ignore',
    skip: skipQuery,
    variables,
    notifyOnNetworkStatusChange: true,
    pollInterval,
    onCompleted: (data) => {
      if (data?.endorsements) {
        onSuccess(data?.endorsements);
      }
    },
    onError,
  });
};
