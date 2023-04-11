import React, { useEffect, useState } from 'react';
import Slider from '../Home/Components/Slider';
import { GQLCollection, GQLTokenPaginationSort } from '../../types/graphql.schema';
import { Input, Pagination, Result, Skeleton } from 'antd';
import classes from './index.module.scss';
import { SearchOutlined } from '@ant-design/icons';
import CollectionCardWrapper from '../User/components/CollectionCard/CollectionCardWrapper';
import { usePaginationCollections } from '../../hooks/collections';
import { IUser } from '../../types/User/User';
import ArrayUtil from '../../utils/ArrayUtil';
import Category from '../../components/Category';
import UserLink from '../../components/UserLink';
import getMediaUrl from '../../utils/getMediaUrl';
import usePagination from '../../hooks/pagination';
import useQueryParams from '../../hooks/queryParams';
import useWindowDimensions from '../../hooks/useWindowDimensions';
import CreateTokenButton from '../Activity/components/CreateTokenButton';
import { useUsers } from '../../hooks/users';
import Loader from '../../components/Loader';
import MetaTags from '../Token/components/MetaTags';
import { useMetaTags } from '../../hooks/useMetaTags';
import useDebounce from '../../hooks/useDebounce';
import { useUiManagementData } from '../../hooks/new/useUiManagementData';
import { UiManagementType } from '../../types/UiManagementType';
import { PageType } from '../../types/pages';
import ServerSideMetaTags from '../../utils/ServerSideMetaTags';
import { CollectionsPageProps } from './types';

const CollectionsPage = ({ meta }: CollectionsPageProps) => {
  const { getUiManagementData } = useUiManagementData();
  const { getQueryParam } = useQueryParams();
  const { width: innerWindowWidth, maxMobileWidth } = useWindowDimensions();
  const currentSearchQuery = getQueryParam('search') as string;
  const [searchQuery, setSearchQuery] = useState<string | undefined>(
    currentSearchQuery || undefined,
  );
  const debouncedValue = useDebounce<string>(searchQuery || '', 500);

  const [collections, setCollections] = useState<GQLCollection[]>();
  const [users, setUsers] = useState<IUser[] | undefined>(undefined);
  const [creatorsAddresses, setCreatorsAddresses] = useState<(string | undefined)[]>();
  const { limit, setLimit, page, setPage } = usePagination({ defaultLimit: 20 });

  const changeCurrentSearch = async (value: string | undefined) => {
    setSearchQuery(value);
  };

  React.useEffect(() => {
    setPage(1);
  }, [debouncedValue]);

  const { count } = usePaginationCollections({
    skipQuery: false,
    variables: {
      query: {
        limit,
        skip: (page - 1) * limit,
        search: debouncedValue,
        sort: GQLTokenPaginationSort.CREATED_DESC,
      },
    },
    onSuccess: (data) => {
      const filteredData = data.filter((item) => item.raw?.creator && item.deployed?.creator);
      setCollections(filteredData);
    },
    onError: (error) => console.error(error),
  });

  useEffect(() => {
    if (!collections) return;
    const creators = ArrayUtil.getUniqueValues(
      collections.map((collection) => collection?.raw?.creator),
    );
    setCreatorsAddresses(creators);
  }, [collections]);

  useUsers({
    skipQuery: !creatorsAddresses,
    variables: {
      query: {
        walletAddress_in: creatorsAddresses,
      },
    },
    onSuccess: (data: any) => setUsers(data.users),
    onError: (e) => console.error(e),
  });

  const renderUsers = () => {
    if (!users) {
      return <span style={{ fontSize: 20, height: '50px' }}>There are no users yet</span>;
    }

    return users.map((user: IUser, index) => {
      const { username, accountNumber, avatarHash, nickname } = user;
      return (
        <UserLink
          className={classes.user}
          userId={username || accountNumber}
          key={index.toString()}>
          {avatarHash ? (
            <img
              className={classes.user__avatar}
              src={getMediaUrl(avatarHash, 'image', {
                height: 50,
                width: 50,
                compressionQuality: 70,
              })}
            />
          ) : (
            <Skeleton.Avatar size={50} />
          )}
          <div className={classes.user__info}>
            <span className={classes.user__name}>{nickname || 'anonymous'}</span>
          </div>
        </UserLink>
      );
    });
  };

  if (!collections || !users) {
    return (
      <>
        <Loader text="Collections are being loaded" />
        <MetaTags title={meta.title} description={meta.description} image={meta.imgSrc} />
      </>
    );
  }

  return (
    <>
      <MetaTags title={meta.title} description={meta.description} image={meta.imgSrc} />
      <Slider mainSliders={getUiManagementData(UiManagementType.MAIN_SLIDER)} />
      <div className={classes.buttonWrap}>
        <Input
          className="search"
          onChange={(e) => changeCurrentSearch(e.target.value)}
          placeholder="SEARCH COLLECTIONS"
          value={searchQuery}
          prefix={<SearchOutlined />}
        />
        {innerWindowWidth > maxMobileWidth && <CreateTokenButton />}
      </div>

      <Category className={classes.creators} deepBg title="Creators">
        <div className={classes.users}>
          {users.length ? (
            renderUsers()
          ) : (
            <span style={{ fontSize: 20, height: '50px', color: 'white' }}>
              There are no users yet
            </span>
          )}
        </div>
      </Category>

      <div className={classes.collectionsWrapper}>
        <div className={classes.collectionsWrapper_titleRow}>
          <Category bgTitleColor="#dee1e8" title="Collections">
            {collections && users && (
              <>
                {!collections.length && <Result title="There are no matches to your request" />}
                <CollectionCardWrapper collections={collections} users={users} />
                <div className={classes.paginationWrap}>
                  <div className={classes.paginationSection}>
                    <Pagination
                      current={page}
                      defaultCurrent={1}
                      defaultPageSize={20}
                      pageSize={limit}
                      total={count}
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
                </div>
              </>
            )}
          </Category>
        </div>
      </div>
    </>
  );
};

export default CollectionsPage;
