import { GQLSeries, GQLSeriesPagination } from '../../types/graphql.schema';
import { ApolloError, useQuery } from '@apollo/client';
import { getSeries, getSeriesCount, getSeriesPagination, getSeriess } from '../../gql/query/series';
import React from 'react';

export const useSeriesPagination = (params: {
  skipQuery: boolean;
  variables: GQLSeriesPagination;
  pollInterval?: number;
  onSuccess: (seriesPagination: GQLSeries[]) => void;
  onError: (e: ApolloError) => void;
}) => {
  const { skipQuery, variables, pollInterval, onSuccess, onError } = params;
  const { loading: loadingCount, data: count } = useQuery<{ seriesCount: number }>(getSeriesCount, {
    errorPolicy: 'ignore',
    skip: skipQuery,
    variables: {
      creator: variables.creator,
    },
    notifyOnNetworkStatusChange: true,
    pollInterval,
    onError,
  });
  const { loading, data } = useQuery<{ seriesPagination: GQLSeries[] }>(getSeriesPagination, {
    errorPolicy: 'ignore',
    skip: skipQuery,
    variables,
    notifyOnNetworkStatusChange: true,
    pollInterval,
    onCompleted: (data) => {
      onSuccess(data?.seriesPagination);
    },
    onError,
  });
  return { loading: loadingCount || loading, data, count: count?.seriesCount };
};

export const useSeries = (params: {
  skipQuery: boolean;
  variables: Record<string, any>;
  pollInterval?: number;
  onSuccess: (series?: GQLSeries) => void;
  onError: (e: ApolloError) => void;
}) => {
  const { skipQuery, variables, pollInterval, onSuccess, onError } = params;
  useQuery<{ series: GQLSeries }>(getSeries, {
    skip: skipQuery,
    variables,
    notifyOnNetworkStatusChange: true,
    pollInterval,
    onCompleted: (data) => {
      onSuccess(data?.series);
    },
    onError,
  });
};

export const useSeriess = (params: {
  skipQuery: boolean;
  variables: Record<string, any>;
  pollInterval?: number;
  onSuccess: (seriess: GQLSeries[]) => void;
  onError: (e: ApolloError) => void;
}) => {
  const [dataLoaded, setDataLoaded] = React.useState(false);
  const { skipQuery, variables, pollInterval, onSuccess, onError } = params;
  const { loading, data } = useQuery<{ seriess: GQLSeries[] }>(getSeriess, {
    skip: skipQuery || dataLoaded,
    variables,
    notifyOnNetworkStatusChange: true,
    pollInterval,
    onCompleted: (data) => {
      if (data?.seriess) {
        onSuccess(data?.seriess);
      }
    },
    onError,
  });

  // Do not delete this code, because of it the series will not be displayed correctly in the Activity

  React.useEffect(() => {
    if (data) {
      setDataLoaded(true);
    }
  }, [data]);

  return { loading };
};
