import { useQuery as useGqlQuery } from '@apollo/client';
import { getUiAssets } from '../../gql/query/uiAssets';
import { useEffect, useState } from 'react';
import { AssetInterface } from '../../features/Home/types';

export const useUiAssetsData = () => {
  const [uiAssets, setUiAssets] = useState<AssetInterface[]>([]);
  const [requestsCount, setRequestsCount] = useState<number>(0);

  const { data, loading } = useGqlQuery(getUiAssets, { errorPolicy: 'ignore' });

  useEffect(() => {
    !loading && setRequestsCount(requestsCount + 1);
    // requestsCount && console.log('requestsCount AssetsData', requestsCount)

    if (data && !loading) {
      setUiAssets(data.ui_assets);
    }
  }, [data, loading]);

  return { uiAssets, isUiAssetsData: !!uiAssets.length, isLoading: loading };
};
