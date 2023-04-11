import { GQLLocale } from '../../types/graphql.schema';
import { ApolloError, useQuery } from '@apollo/client';
import { getLocale, getLocales } from '../../gql/query/locale';

export const useLocale = (params: {
  skipQuery: boolean;
  variables: Record<string, any>;
  pollInterval?: number;
  onSuccess: (locale: GQLLocale) => void;
  onError: (e: ApolloError) => void;
}) => {
  const { skipQuery, variables, pollInterval, onSuccess, onError } = params;
  useQuery<{ locale: GQLLocale }>(getLocale, {
    errorPolicy: 'ignore',
    skip: skipQuery,
    variables,
    notifyOnNetworkStatusChange: true,
    pollInterval,
    onCompleted: (data) => {
      if (data?.locale) {
        onSuccess(data?.locale);
      }
    },
    onError,
  });
};

export const useLocales = (params: {
  skipQuery: boolean;
  variables: Record<string, any>;
  pollInterval?: number;
  onSuccess: (locale: GQLLocale[]) => void;
  onError: (e: ApolloError) => void;
}) => {
  const { skipQuery, variables, pollInterval, onSuccess, onError } = params;
  useQuery<{ locales: GQLLocale[] }>(getLocales, {
    errorPolicy: 'ignore',
    skip: skipQuery,
    variables,
    notifyOnNetworkStatusChange: true,
    pollInterval,
    onCompleted: (data) => {
      if (data?.locales) {
        onSuccess(data?.locales);
      }
    },
    onError,
  });
};
