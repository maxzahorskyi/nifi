import { useLocales } from '../locales';
import { useEffect, useState } from 'react';
import { GQLLocale } from '../../types/graphql.schema';

export const useFrontStatus = () => {
  const [frontStatusData, setFrontStatusData] = useState<GQLLocale[]>();
  const [frontStatusArray, setFrontStatusArray] = useState<(string | undefined)[]>([]);

  useLocales({
    skipQuery: !!frontStatusData,
    variables: {
      query: {
        lang: 'EN',
        module: {
          type: 'universal',
          page: 'global',
          module: 'frontStatus',
        },
      },
    },
    pollInterval: frontStatusData ? 0 : 1000,
    onSuccess: (data) => setFrontStatusData(data),
    onError: (error) => console.error(error),
  });

  useEffect(() => {
    setFrontStatusArray(frontStatusData?.map((status) => status.string) || []);
  }, [frontStatusData]);

  const getFrontStatus = (frontStatus?: string) => {
    if (frontStatus) {
      return frontStatusData?.find(({ stringName }: GQLLocale) => stringName === frontStatus)
        ?.string;
    }
    return '';
  };

  return {
    frontStatusArray,
    isFrontStatusData: !!frontStatusArray.length,
    getFrontStatus,
  };
};

export const enum FrontStatus {
  ON_SALE = 'ON SALE',
  ON_ENDORSEMENT = 'ON ENDORSEMENT',
  ACCEPTING_BIDS = 'ACCEPTING BIDS',
  AUCTION = 'AUCTION',
  DRAFT = 'DRAFT',
  FOREVER = 'FOREVER',
  EXPIRED = 'EXPIRED',
}
