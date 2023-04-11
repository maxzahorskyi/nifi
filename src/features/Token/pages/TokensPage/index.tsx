/* eslint-disable no-continue */
/* eslint-disable no-restricted-syntax */
import React, { useState } from 'react';
import classes from './index.module.scss';
import TextSwitch from '../../../../components/TextSwitch';
import Category from '../../../../components/Category';
import { Input, Skeleton } from 'antd';
import cn from 'classnames';
import getMediaUrl from '../../../../utils/getMediaUrl';
import AddressUtil from '../../../../utils/AddressUtil';
import i18n from 'i18next';
import UserLink from '../../../../components/UserLink';
import { SearchOutlined } from '@ant-design/icons';
import { TokenSaleType } from '../../../../types/Tokens/Token';
import { IUser } from '../../../../types/User/User';
import useWindowDimensions from '../../../../hooks/useWindowDimensions';
import useQueryParams from '../../../../hooks/queryParams';
import CreateTokenButton from '../../../Activity/components/CreateTokenButton';
import Gallery from './Gallery';
import { useTranslation } from 'react-i18next';
import MetaTags from '../../components/MetaTags';
import { useMetaTags } from '../../../../hooks/useMetaTags';
import useDebounce from '../../../../hooks/useDebounce';
import { PageType } from '../../../../types/pages';
import { TokensPageProps } from '../../types/types';

export enum SaleTypeFilter {
  All = 'All',
  OnSale = 'OnSale',
  LiveBids = 'LiveBids',
}
export enum UsersFilter {
  All = 'All',
  Collectors = 'Collectors',
  Creators = 'Creators',
}

export const saleTypeFilters = [
  {
    title: i18n.t('TokensPage.All'),
    key: SaleTypeFilter.All,
    isSuitableBySaleType: () => true,
  },
  {
    title: i18n.t('TokensPage.OnSale'),
    key: SaleTypeFilter.OnSale,
    isSuitableBySaleType: (saleType: TokenSaleType) => saleType === TokenSaleType.Auction,
  },
  {
    title: i18n.t('TokensPage.LiveBids'),
    key: SaleTypeFilter.LiveBids,
    isSuitableBySaleType: (saleType: TokenSaleType) => saleType === TokenSaleType.Offer,
  },
];
export const usersFilters = [
  {
    title: 'All',
    key: UsersFilter.All,
    getSuitableUsers: (users: Users) => users.creators.concat(users.collectors),
  },
  {
    title: 'Collectors',
    key: UsersFilter.Collectors,
    getSuitableUsers: (users: Users) => users.collectors,
  },
  {
    title: 'Creators',
    key: UsersFilter.Creators,
    getSuitableUsers: (users: Users) => users.creators,
  },
];

export const DEFAULT_SALE_TYPE_FILTER_KEY = SaleTypeFilter.All;
export const DEFAULT_USERS_FILTER_KEY = UsersFilter.All;

const TokensPage = ({ meta }: TokensPageProps) => {
  const { t } = useTranslation();
  const { width, maxMobileWidth } = useWindowDimensions();
  const { getQueryParam } = useQueryParams();

  const currentSearchQuery = getQueryParam('search') as string;
  const [searchQuery, setSearchQuery] = useState<string | undefined>(
    currentSearchQuery || undefined,
  );
  const debouncedValue = useDebounce<string | undefined>(searchQuery);

  const [currentUsersFilterKey, setCurrentUsersFilterKey] =
    useState<UsersFilter>(DEFAULT_USERS_FILTER_KEY);
  const [collectorsAndCreators, setCollectorsAndCreators] = useState<Users>();

  const renderUsers = () => {
    const message = (
      <span style={{ fontSize: 20, height: '50px', color: 'white' }}>There are no users yet</span>
    );
    if (!collectorsAndCreators) {
      return message;
    }

    const unfilteredUsersToRender =
      usersFilters
        .find((filter) => filter.key === currentUsersFilterKey)
        ?.getSuitableUsers(collectorsAndCreators) || [];

    const usersToRender: (string | IUser)[] = [];

    for (const unfilteredUser of unfilteredUsersToRender) {
      if (typeof unfilteredUser === 'string') {
        if (usersToRender.includes(unfilteredUser)) continue;
      } else {
        let isFound = false;

        for (const user of usersToRender) {
          if (typeof user === 'string') continue;
          if (user?.walletAddress !== unfilteredUser?.walletAddress) continue;

          isFound = true;
        }

        if (isFound) continue;
      }

      usersToRender.push(unfilteredUser);
    }

    if (!usersToRender.length) {
      return message;
    }

    return usersToRender.map((creator, index) => {
      const isAnonymous = (user: IUser | string): user is string => {
        return typeof creator === 'string';
      };

      const avatarHash = !isAnonymous(creator) && creator?.avatarHash;

      return (
        <UserLink
          key={index}
          className={classes.user}
          userId={!isAnonymous(creator) ? creator?.username ?? creator?.accountNumber : creator}>
          {avatarHash ? (
            <img
              className={classes.user__avatar}
              src={getMediaUrl(avatarHash, 'image', { height: 50, width: 50 })}
            />
          ) : (
            <Skeleton.Avatar size={50} />
          )}

          <div className={classes.user__info}>
            <span className={classes.user__name}>
              {isAnonymous(creator) ? 'anonymous' : creator?.nickname}
            </span>
            <span className={classes.user__name}>
              {isAnonymous(creator) ? AddressUtil.shorten(creator) : `@${creator?.username}`}
            </span>
          </div>
        </UserLink>
      );
    });
  };

  return (
    <>
      <MetaTags title={meta.title} description={meta.description} image={meta.imgSrc} />
      <div className={classes.buttonWrap}>
        <Input
          className="search"
          placeholder="SEARCH TOKENS"
          onChange={(e) => setSearchQuery(e.target.value)}
          value={searchQuery}
          prefix={<SearchOutlined />}
        />
        {width > maxMobileWidth && (
          <div className={classes.buttonLinkWrapper}>
            <CreateTokenButton />
          </div>
        )}
      </div>

      {width > maxMobileWidth && (
        <div className={cn(classes.filterWrap, classes.deepBlueBg)}>
          <TextSwitch
            filters={usersFilters}
            deepBg
            getTitle={(i) => i.title}
            isActive={(item) => item.key === currentUsersFilterKey}
            getKey={(item) => item.key}
            onItemClick={(item) => setCurrentUsersFilterKey(item.key)}
            currentUsersFilterKey={currentUsersFilterKey}
          />
        </div>
      )}

      <Category
        title="Collectors"
        style={{ paddingTop: width > maxMobileWidth ? 0 : 35 }}
        deepBg
        filters={
          width <= maxMobileWidth && (
            <TextSwitch
              filters={usersFilters}
              deepBg
              getTitle={(i) => i.title}
              isActive={(item) => item.key === currentUsersFilterKey}
              getKey={(item) => item.key}
              onItemClick={(item) => setCurrentUsersFilterKey(item.key)}
            />
          )
        }>
        <div className={classes.users}>{renderUsers()}</div>
      </Category>

      <Gallery
        title={t('OnSalePage.Tokens')}
        defaultLimit={100}
        search={debouncedValue}
        setCollectorsAndCreators={setCollectorsAndCreators}
        filterConst={saleTypeFilters}
        filterConstDefault={DEFAULT_SALE_TYPE_FILTER_KEY}
        isExternal
      />
    </>
  );
};

export default TokensPage;

export interface Users {
  creators: (IUser | string)[];
  collectors: (IUser | string)[];
}
