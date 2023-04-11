import React, { useEffect, useMemo, useState } from 'react';
import classes from '../index.module.scss';

import TextSwitch from '../../../../../components/TextSwitch';
import Category from '../../../../../components/Category';
import Tokens from '../../../components/Tokens';
import { Pagination } from 'antd';
import { SaleTypeFilter, Users } from '../index';
import ThemeSwitcher from '../../../../../components/ThemeSwitcher';
import cn from 'classnames';
import LinkComponent from '../../../../../components/Link';
import useWindowDimensions from '../../../../../hooks/useWindowDimensions';
import { useTranslation } from 'react-i18next';
import useQueryParams from '../../../../../hooks/queryParams';
import usePagination from '../../../../../hooks/pagination';
import useContractsContext from '../../../../../hooks/useContractsContext';
import { useQuery as useGqlQuery } from '@apollo/client/react/hooks/useQuery';
import {
  GQLAsk,
  GQLAuction,
  GQLBid,
  GQLSeries,
  GQLTokenPagination,
  GQLTokenPaginationSort,
} from '../../../../../types/graphql.schema';
import { getTokensProps } from '../../../../../gql/query/token';
import { IToken } from '../../../../../types/Tokens/Token';
import { useTokenPagination } from '../../../../../hooks/tokens';
import ArrayUtil from '../../../../../utils/ArrayUtil';
import { useUsers } from '../../../../../hooks/users';
import { IUser } from '../../../../../types/User/User';
import { useAuctions } from '../../../../../hooks/auctions';
import { useAsks } from '../../../../../hooks/asks';
import { useBids } from '../../../../../hooks/bids';
import { useSeriesPagination } from '../../../../../hooks/series';
import Series from '../../../components/Series';
import { FrontStatus } from '../../../../../hooks/status/useFrontStatus';

const timestamp = Math.floor(Date.now() / 1000);
const endTime_gt = timestamp - (timestamp % 15);

const Gallery = ({
  title,
  search,
  filter,
  setCollectorsAndCreators,
  filterConst,
  filterConstDefault,
  setCurrentFilterKeyProps,
  usersProps,
  defaultLimit,
  isExternal = false,
}: Props) => {
  const [theme, setTheme] = useState<boolean>(
    typeof window !== 'undefined' && !Number(localStorage.getItem('Theme')),
  );
  const { width, maxMobileWidth } = useWindowDimensions();
  const { t } = useTranslation();
  const { contractTypes } = useContractsContext();
  const { getQueryParam } = useQueryParams();

  const filterTypeQuery = getQueryParam('filtertype') as string;
  const [currentFilterKey, setCurrentFilterKey] = useState<string | undefined>(
    filterTypeQuery || filterConstDefault,
  );

  const currentVersionQuery = getQueryParam('type') as string;
  const [currentVersion, setCurrentVersion] = useState<string | undefined>(currentVersionQuery);

  const [queryQueue, setQueryQueue] = useState<'ask' | 'bids' | 'auction' | boolean | undefined>(
    undefined,
  );

  const [versions, setVersions] = useState<string[] | undefined>(undefined);

  const [users, setUsers] = useState<IUser[]>();
  const [tokens, setTokens] = useState<IToken[] | undefined>();
  const [series, setSeries] = useState<GQLSeries[]>();

  const [currTimeout, setCurrTimeout] = useState<NodeJS.Timeout>();

  const userAddresses = useMemo(() => {
    if (!tokens) return { creators: [], collectors: [] };
    const creators = ArrayUtil.getUniqueValues(tokens.map((token) => token?.deployed?.creator));
    const collectors = ArrayUtil.getUniqueValues(
      tokens.map((token) => token?.deployed?.owner).filter((a) => typeof a === 'string'),
    );
    return { creators, collectors };
  }, [tokens]);

  useUsers({
    skipQuery: !!usersProps || !userAddresses,
    variables: { query: { walletAddress_in: userAddresses.creators } },
    onSuccess: (data: any) => setUsers(data.users),
    onError: (e) => console.error(e),
  });

  useEffect(() => {
    if (users && setCollectorsAndCreators) {
      const creators = userAddresses.creators.map(
        (id) => users.find((user) => user?.walletAddress === id) || (id as string),
      );
      const collectors = userAddresses.collectors.map(
        (id) => users.find((user) => user?.walletAddress === id) || (id as string),
      );
      setCollectorsAndCreators({ creators, collectors });
    }
  }, [users, userAddresses]);

  const { page, setPage, limit, setLimit, time, changeTime, changePaginationParam, queryObject } =
    usePagination({ isExternal, defaultLimit });

  const changeFilterType = (value: SaleTypeFilter) => {
    setCurrentFilterKeyProps && setCurrentFilterKeyProps(value);

    setCurrentFilterKey(value);
    changePaginationParam('filtertype', value);
  };

  const changeCurrentVersion = (value: string | undefined) => {
    setCurrentVersion(value);
    changePaginationParam('type', value);
  };

  const clearFilters = () => changePaginationParam();

  useEffect(() => {
    if (!isExternal) return;

    // Save values on reboot
    const type = getQueryParam('type');
    const filterType = getQueryParam('filtertype');

    setCurrentFilterKey((filterType && String(filterType)) || currentFilterKey);
    setCurrentVersion((type && String(type)) || currentVersion);
  }, [queryObject]);

  const { loading: tokensLoading, count: tokensCount } = useTokenPagination({
    skipQuery: currentFilterKey === 'Series',
    variables: {
      ...filter,
      search,
      limit,
      skip: (page - 1) * limit,
      type: currentVersion,
      sort: GQLTokenPaginationSort.CREATED_DESC,
      created_lt: time,
      isOnSale: currentFilterKey === 'OnSale',
      isLiveBid: currentFilterKey === 'LiveBids',
      qualification_gte: 0,
    },
    onSuccess: (data) => {
      const tokens = data?.filter(
        (token: IToken) =>
          token.deployed &&
          token.deployed.frontStatus !== FrontStatus.EXPIRED.toLowerCase() &&
          token.tokenID,
      );
      setTokens(tokens);
      tokens?.length && setQueryQueue('ask');
    },
    onError: (error) => console.error(error),
  });

  const { loading: seriesLoading, count: seriesCount } = useSeriesPagination({
    skipQuery: false,
    variables: {
      creator: filter?.owner || filter?.creator,
      limit,
      skip: (page - 1) * limit,
      created_lt: time,
    },
    onSuccess: (data) => {
      setSeries(data);
    },
    onError: (error) => console.error(error),
  });

  const seriesNumber = series?.filter(({ deployed }) => deployed?.supply === 0)?.length;
  const isTokensLoader = !tokens || tokensLoading || tokens.length === 0;
  const tokenID_in = tokens?.map((item) => item.tokenID);

  const updateTokens = () => {
    changeTime();
    setPage(1);
  };

  useAsks({
    skipQuery: isTokensLoader || queryQueue !== 'ask',
    variables: {
      query: {
        deployed: {
          tokenID_in,
          endTime_gt,
        },
      },
    },
    onSuccess: (data) => {
      setTokens(
        tokens?.map((item) => {
          const ask = data.find((ask: GQLAsk) => ask?.deployed?.tokenID === item.tokenID);
          return ask ? { ...item, ask } : item;
        }),
      );
      setQueryQueue('bids');
    },
    onError: (error) => console.error(error),
  });
  useBids({
    skipQuery: isTokensLoader || queryQueue !== 'bids',
    variables: {
      query: {
        deployed: {
          tokenID_in,
          endTime_gt,
        },
      },
    },
    onSuccess: (data) => {
      setTokens(
        tokens?.map((item) => {
          const bids = data.filter((bid: GQLBid) => bid?.deployed?.tokenID === item.tokenID);
          return bids ? { ...item, bids } : item;
        }),
      );
      setQueryQueue('auction');
    },
    onError: (error) => console.error(error),
  });
  useAuctions({
    skipQuery: isTokensLoader || queryQueue !== 'auction',
    variables: {
      query: {
        deployed: {
          tokenID_in,
          endTime_gt,
        },
      },
    },
    onSuccess: (data) => {
      setTokens(
        tokens?.map((item) => {
          const auction = data.find(
            (auction: GQLAuction) => auction?.deployed?.tokenID === item.tokenID,
          );
          return auction ? { ...item, auction } : item;
        }),
      );
      setQueryQueue(false);
    },
    onError: (error) => console.error(error),
  });

  useGqlQuery(getTokensProps, {
    errorPolicy: 'ignore',
    variables: { type: 'deployed.type' },
    onCompleted: (data) => setVersions(data?.distinctTokensProps),
  });

  useEffect(() => {
    if (search === undefined) return;
    changePaginationParam('search', search);
  }, [search]);

  useEffect(() => {
    currTimeout && clearTimeout(currTimeout);
    setCurrTimeout(
      setTimeout(() => {
        if (queryQueue) {
          setQueryQueue(false);
        }
      }, 3000),
    );
  }, [queryQueue]);

  const getCategoryTitle = (title: string) => {
    return (
      <div className={classes.categoryTitleWrap}>
        <span>{title}</span>{' '}
        <div onClick={updateTokens} className={classes.refreshButton}>
          <img src="/icons/reloadIcon.svg" alt="reload" />
        </div>
        <ThemeSwitcher setTheme={setTheme} className={classes.themeSwitcher} />
        {width > maxMobileWidth && (
          <div
            className={cn(classes.list, classes.categoryTitleWrap__links)}
            style={{ textTransform: 'lowercase' }}>
            <div className={classes.linkWrap} onClick={() => changeCurrentVersion(undefined)}>
              <LinkComponent
                isActive={currentFilterKey === 'Series' || !currentVersion}
                text={t('OnSalePage.ViewAll')}
              />
            </div>

            {currentFilterKey !== 'Series' &&
              versions?.map((version, index) =>
                version ? (
                  <div
                    className={classes.linkWrap}
                    onClick={() => changeCurrentVersion(version)}
                    key={index.toString()}>
                    <LinkComponent
                      isActive={version === currentVersion}
                      text={
                        contractTypes?.find((contract) => contract.longType === `nifi.${version}`)
                          ?.frontendName || version
                      }
                    />
                  </div>
                ) : null,
              )}
          </div>
        )}
      </div>
    );
  };
  return (
    <>
      {width > maxMobileWidth && filterConst && (
        <div className={classes.filterWrap}>
          <TextSwitch
            seriesNumber={seriesNumber}
            filters={filterConst}
            getTitle={(i: any) => i.title}
            isActive={(item) => item.key === currentFilterKey}
            getKey={(item) => item.key}
            onItemClick={(item) => changeFilterType(item.key)}
          />
        </div>
      )}

      <Category
        title={getCategoryTitle(title || currentFilterKey || 'Tokens')}
        style={{ marginTop: width > maxMobileWidth ? 55 : 35 }}
        filterMaxMobileWidth
        filters={
          width <= maxMobileWidth &&
          filterConst && (
            <TextSwitch
              seriesNumber={seriesNumber}
              filters={filterConst}
              getTitle={(i: any) => i.title}
              isActive={(item) => item.key === currentFilterKey}
              getKey={(item) => item.key}
              onItemClick={(item) => changeFilterType(item.key)}
            />
          )
        }>
        {currentFilterKey === 'Series' ? (
          <Series
            isDesign={!theme}
            serieses={series}
            users={usersProps || users}
            isLoading={seriesLoading}
          />
        ) : (
          <Tokens
            isDesign={!theme}
            tokens={tokens}
            users={usersProps || users}
            clearFilters={clearFilters}
            isLoading={tokensLoading || !!queryQueue}
            isTokensLoading={queryQueue !== false}
          />
        )}
        <div className={classes.paginationSection}>
          <Pagination
            current={page}
            defaultCurrent={1}
            defaultPageSize={defaultLimit}
            pageSize={limit}
            total={currentFilterKey === 'Series' ? seriesCount : tokensCount}
            onChange={(page, pageSize) => {
              window.scroll({ top: 300, behavior: 'smooth' });
              if (pageSize && pageSize !== limit) {
                setLimit(pageSize);
              } else {
                setPage(page);
              }
            }}
            showQuickJumper
          />
        </div>
      </Category>
    </>
  );
};

interface Props {
  title?: string;
  search?: string;
  filter?: GQLTokenPagination;
  setCollectorsAndCreators?: (data: Users) => void;
  filterConst?: any;
  filterConstDefault?: string;
  defaultLimit: number;
  setCurrentFilterKeyProps?: (data: string) => void;
  usersProps?: IUser[] | any;
  isExternal?: boolean;
}

export default Gallery;
