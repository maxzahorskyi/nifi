import React, { useEffect, useState } from 'react';
import Category from '../../../../components/Category';
import { useTranslation } from 'react-i18next';
import Table from '../../../../components/Table';
import classes from './index.module.scss';
import { Pagination } from 'antd';
import { useQuery as useGqlQuery } from '@apollo/client';
import { getActionCount, getActionsWithPagination } from '../../../../gql/query/action';
import { GQLAction, GQLCollection, GQLSeries, GQLToken } from '../../../../types/graphql.schema';
import { getTokens } from '../../../../gql/query/token';
import useWindowDimensions from '../../../../hooks/useWindowDimensions';
import { useSeriess } from '../../../../hooks/series';
import usePagination from '../../../../hooks/pagination';
import ActivityColumnsDesktop from '../../components/ActivityColumnsDesktop';
import ActivityColumnsMobile from '../../components/ActivityColumnsMobile';
import CreateTokenButton from '../../components/CreateTokenButton';
import Loader from '../../../../components/Loader';
import MetaTags from '../../../Token/components/MetaTags';
import { useMetaTags } from '../../../../hooks/useMetaTags';
import { PageType } from '../../../../types/pages';
import { ActivityPageProps } from '../../types';
import { getCollections } from '../../../../gql/query/collection';

const ActivityPage = ({ meta }: ActivityPageProps) => {
  const { t } = useTranslation();
  const { width: innerWindowWidth, maxMobileWidth } = useWindowDimensions();
  const [token, setToken] = useState<GQLToken[]>();
  const [seriesArray, setSeriesArray] = useState<GQLSeries[]>();
  const [collectionArray, setCollectionArray] = useState<GQLCollection[]>();
  const [paginatedActions, setPaginatedActions] = useState<GQLAction[]>([]);
  const [tokenIDs, setTokenIDs] = useState<string[] | undefined>(
    paginatedActions
      ?.filter((item) => !!item.tokenAttributes?.tokenID)
      .map((item) => item.tokenAttributes?.tokenID as string),
  );
  const [seriesIDs, setSeriesIDs] = useState<string[] | undefined>(
    paginatedActions
      ?.filter((item) => !!item.tokenAttributes?.seriesID?.seriesID)
      .map((item) => item.tokenAttributes?.seriesID?.seriesID as string),
  );
  const [collectionIDs, setCollectionIDs] = useState<string[] | undefined>();

  useEffect(() => {
    setTokenIDs(
      paginatedActions
        ?.filter((item) => !!item.tokenAttributes?.tokenID)
        .map((item) => item.tokenAttributes?.tokenID as string),
    );
    setSeriesIDs(
      paginatedActions
        ?.filter((item) => !!item.tokenAttributes?.seriesID?.seriesID)
        .map((item) => item.tokenAttributes?.seriesID?.seriesID as string),
    );
    setCollectionIDs(
      paginatedActions
        ?.filter((item) => {
          return item.message?.actionCode?.code === 'COL-CT';
        })
        .map((item) => item.message?.senderID as string),
    );
  }, [paginatedActions]);
  const { limit, setLimit, page, setPage } = usePagination({ defaultLimit: 100 });
  const { data: actionsCount } = useGqlQuery(getActionCount, { errorPolicy: 'ignore' });
  const { data: actionsData, loading: actionsLoading } = useGqlQuery(getActionsWithPagination, {
    errorPolicy: 'ignore',
    variables: { limit, skip: (page - 1) * limit },
    onCompleted: (data) => {
      setPaginatedActions(data.paginationAction);
    },
  });

  const { loading: tokenLoading } = useGqlQuery(getTokens, {
    errorPolicy: 'ignore',
    skip: !tokenIDs,
    variables: { query: { tokenID_in: tokenIDs } },
    onCompleted: (data) => {
      setToken(data.tokens);
    },
  });

  const { loading: seriesLoading } = useSeriess({
    skipQuery: !(seriesIDs && seriesIDs.length > 0),
    variables: { query: { seriesID_in: seriesIDs } },
    onSuccess: (data) => {
      setSeriesArray(data);
    },
    onError: (e) => console.log(e),
  });

  const { loading: collectionLoading } = useGqlQuery(getCollections, {
    errorPolicy: 'ignore',
    skip: !collectionIDs,
    variables: { query: { collectionID_in: collectionIDs } },
    onCompleted: (data) => {
      setCollectionArray(data.collections);
    },
  });

  const isLoading = tokenLoading && actionsLoading && seriesLoading && collectionLoading;

  const activityColumns =
    innerWindowWidth > maxMobileWidth
      ? ActivityColumnsDesktop(t, token, seriesArray, collectionArray)
      : ActivityColumnsMobile(t, token, seriesArray, collectionArray);

  if (isLoading) {
    return (
      <>
        <Loader text="Activity is being loaded" />
        <MetaTags title={meta.title} description={meta.description} image={meta.imgSrc} />
      </>
    );
  }

  return (
    <>
      <MetaTags title={meta.title} description={meta.description} image={meta.imgSrc} />
      <div className="grid-button-right" style={{ marginTop: 75 }}>
        {innerWindowWidth > maxMobileWidth && <CreateTokenButton />}
      </div>
      <Category className={classes.activitiesCategory} title={t('ActivityPage.AllActivities')}>
        <Table
          dataSource={actionsData?.paginationAction || []}
          columns={activityColumns}
          width={innerWindowWidth}
        />
        {actionsCount?.actionCount > limit && (
          <div className={classes.activitiesPagination}>
            <Pagination
              current={page}
              defaultCurrent={1}
              defaultPageSize={100}
              pageSize={limit}
              total={actionsCount?.actionCount}
              onChange={(page, pageSize) => {
                window.scroll({ top: 0, behavior: 'smooth' });
                if (pageSize && pageSize !== limit) {
                  setLimit(pageSize);
                } else {
                  setPage(page);
                }
              }}
              showQuickJumper
              className={classes.activitiesPaginationComponent}
              selectPrefixCls={classes.activitiesPaginationComponentI}
            />
          </div>
        )}
      </Category>
    </>
  );
};

export default ActivityPage;
