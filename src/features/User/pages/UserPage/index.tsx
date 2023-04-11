import React, { useEffect, useCallback, useState } from 'react';
import { useRouter } from 'next/router';
import Button, { ButtonType } from '../../../../components/Button';
import { Pagination, Result } from 'antd';
import Link from 'next/link';
import getMediaUrl from '../../../../utils/getMediaUrl';
import classes from './index.module.scss';
import cn from 'classnames';
import UserInfo from '../../../../components/UserInfo';
import StringUtil from '../../../../utils/StringUtil';
import useAuthContext from '../../../../hooks/useAuthContext';
import LinkList from '../../../../components/LinkList';
import AddressUtil from '../../../../utils/AddressUtil';
import UIExceptionUtil from '../../../../utils/UIExceptionUtil';
import Tokens from '../../../Token/components/Tokens';
import { IToken } from '../../../../types/Tokens/Token';
import { GQLCollection, GQLUser } from '../../../../types/graphql.schema';
import useWindowDimensions from '../../../../hooks/useWindowDimensions';
import BigDividerMobile from '../../../../components/BigDividerMobile';
import Title from '../../../../components/Title';
import CollectionCardWrapper from '../../components/CollectionCard/CollectionCardWrapper';
import { usePaginationCollections } from '../../../../hooks/collections';
import { useUser } from '../../../../hooks/users';
import Series from '../../../Token/components/Series';
import usePagination from '../../../../hooks/pagination';
import { ErrorMessageByStatus } from '../../../../utils/errorMessageByStatus';
import Loader from '../../../../components/Loader';
import Gallery from '../../../Token/pages/TokensPage/Gallery';
import MetaTags from '../../../Token/components/MetaTags';
import CreateTokenButton from '../../../Activity/components/CreateTokenButton';

enum TokenAffiliationFilterKey {
  Series = 'Series',
  Tokens = 'Tokens',
  Creations = 'Creations',
}

export const tokenAffiliationFilters = [
  {
    title: 'Tokens',
    key: TokenAffiliationFilterKey.Tokens,
    isSuitableByAffiliation: (walletAddress: string | undefined, token: IToken) => {
      if (!walletAddress) {
        return false;
      }

      return [token?.deployed?.ownerObject?.walletAddress].includes(walletAddress);
    },
  },
  {
    title: 'Creations',
    key: TokenAffiliationFilterKey.Creations,
    isSuitableByAffiliation: (walletAddress: string | undefined, token: IToken) => {
      if (!walletAddress) {
        return false;
      }

      return [token?.deployed?.creator].includes(walletAddress);
    },
  },
  {
    title: 'Series',
    key: TokenAffiliationFilterKey.Series,
  },
];

const DEFAULT_TOKEN_AFFILIATION_FILTER_KEY = TokenAffiliationFilterKey.Tokens;

const UserPage = () => {
  const router = useRouter();
  const authContext = useAuthContext();
  const { width, maxMobileWidth, isDesktopWidth } = useWindowDimensions();

  const { walletAddress } = useAuthContext();

  const identifier = router.query?.usernameOrAccountNumber as string | undefined;
  const [userAboutText, setUserAboutText] = useState<string>('');
  const [isUserAboutTextHide, setIsUserAboutTextHide] = useState<boolean>(true);

  const [user, setUser] = useState<GQLUser | undefined>();
  const [collections, setCollections] = useState<GQLCollection[] | undefined>(undefined);

  const [currentFilterKey, setCurrentFilterKey] = useState<string | undefined>('Tokens');

  const {
    time: timeCollection,
    page: pageCollection,
    limit: limitCollection,
    setLimit: setLimitCollection,
    setPage: setPageCollection,
  } = usePagination({
    pageParam: 'pagecollection',
    limitParam: 'limitcollection',
    defaultLimit: 8,
  });

  const variables = {
    accountNumber: identifier && parseInt(identifier, 10) ? parseInt(identifier, 10) : undefined,
    walletAddress: AddressUtil.isAddress(identifier) ? identifier : undefined,
    username:
      !parseInt(identifier || 'd', 10) && !AddressUtil.isAddress(identifier)
        ? identifier
        : undefined,
  };

  const { error: userError } = useUser({
    skipQuery: false,
    onSuccess: (data) => {
      if (!data?.user && !variables.walletAddress) router.push('/404');
      setUser(
        data?.user || {
          walletAddress: variables?.walletAddress,
        },
      );
    },
    variables: {
      query: variables,
    },
    onError: (e) => console.log(e),
  });

  const { count: collectionCount } = usePaginationCollections({
    skipQuery: !user?.walletAddress,
    variables: {
      query: {
        creator: user?.walletAddress,
        limit: limitCollection,
        skip: (pageCollection - 1) * limitCollection,
        created_lt: timeCollection,
      },
    },
    onSuccess: (collections: GQLCollection[]) => setCollections(collections),
    onError: (error) => console.error(error),
  });

  useEffect(() => renderUserTextMobileLayout(true), [user]);

  const isUserError = userError && !AddressUtil.isAddress(identifier);
  const userErrorStatusForResult = UIExceptionUtil.getStatus(
    userError?.clientErrors ? 500 : undefined,
  );

  const renderUserNickName = useCallback(() => {
    if (user && user.nickname && user.username) {
      return (
        <>
          <span>{user.nickname}</span>
          <span>@{user.username}</span>
        </>
      );
    }

    return (
      <>
        <span>anonymous</span>
        <span>{user?.nickname ?? AddressUtil.shorten(identifier)}</span>
      </>
    );
  }, [user]);

  const userInfo = (
    <UserInfo
      avatarUrl={
        user?.avatarHash &&
        getMediaUrl(user.avatarHash, 'image', {
          width: 80,
          height: 80,
          compressionQuality: 70,
        })
      }
      name={<div className="username">{renderUserNickName()}</div>}
      className={classes.userInfo}
    />
  );

  const renderUserTextMobileLayout = useCallback(
    (hide: boolean) => {
      setIsUserAboutTextHide(!hide);
      if (hide) {
        setUserAboutText(`${user?.about?.substring(0, width - width / 2)}   ...`);
      } else {
        setUserAboutText(user?.about || '');
      }
    },
    [width, user],
  );

  if (!user?.walletAddress) return <Loader text="The user is being loaded" />;

  if (isUserError) {
    return (
      <Result
        status={userErrorStatusForResult}
        title={userErrorStatusForResult}
        subTitle={ErrorMessageByStatus[userErrorStatusForResult]}
        extra={
          <Link href="/">
            <a>
              <div className="centered">
                <Button styleType={ButtonType.Primary}>Back Home</Button>
              </div>
            </a>
          </Link>
        }
      />
    );
  }

  return (
    <React.Fragment key="userPage">
      <MetaTags title={user?.nickname} description={user?.about} imageHash={user?.photoHash} />
      <div className={classes.userInfoWrapper}>
        {user.wallpaperHash && (
          <div className={classes.userInfoWrapper_wallpaperWrapper}>
            <img src={getMediaUrl(user.wallpaperHash, 'image', { width: 1195, height: 300 })} />
          </div>
        )}

        {width < maxMobileWidth && user.photoHash && (
          <div
            style={!user.wallpaperHash ? { bottom: 0, position: 'inherit', left: 0 } : {}}
            className={classes.imageMaskWrapper}>
            <img
              style={!user.wallpaperHash ? { height: '330px', width: '100%', padding: 0 } : {}}
              src={getMediaUrl(user.photoHash, 'image')}
              className={classes.userPhotoMobile}
            />
          </div>
        )}

        {width > maxMobileWidth && (
          <div
            className={classes.userProfile}
            style={user.photoHash ? {} : { marginTop: 10, marginBottom: 20 }}>
            {user.photoHash && (
              <div
                className={cn(classes.imageMask, {
                  [classes.imageMask_imposition!]: user.wallpaperHash,
                })}>
                <img
                  height={500}
                  width={500}
                  src={getMediaUrl(user.photoHash, 'image', {
                    width: 500,
                    height: 500,
                    compressionQuality: 70,
                  })}
                  className={cn(classes.coverImage, classes.userPhoto)}
                />
                <div className={classes.userInfoBlock}>{userInfo}</div>
                {width > maxMobileWidth &&
                  authContext?.isAuthenticated &&
                  authContext?.user?.walletAddress === user?.walletAddress && (
                    <>
                      <div
                        className={classes.settingButton}
                        style={{ bottom: collections?.length === 0 ? 34 : 46 }}>
                        <LinkList
                          items={[
                            <Link href="/user/account/settings">
                              <a>
                                <span>Account settings</span>
                              </a>
                            </Link>,
                          ]}
                          getItemTitle={(item) => item}
                          getIsActive={() => true}
                        />
                        {collections?.length === 0 && (
                          <LinkList
                            items={[
                              <Link href="/collection/create/">
                                <a>
                                  <span>Create collection</span>
                                </a>
                              </Link>,
                            ]}
                            getItemTitle={(item) => item}
                            getIsActive={() => true}
                          />
                        )}
                      </div>
                    </>
                  )}
              </div>
            )}

            {width > maxMobileWidth && (
              <div
                className={classes.userProfile__description}
                style={{ width: `${user.about ? '100%' : '100vw'}` }}>
                {user.about && (
                  <div className={classes.userProfile__about}>
                    <p className={classes.userProfile__text}>
                      {StringUtil.prepareMultilineTextForRendering(user.about)}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {width >= maxMobileWidth && !user.photoHash && (
          <div className={classes.userInfoWithoutHash}>{userInfo}</div>
        )}

        {width < maxMobileWidth && !user.photoHash && <div style={{ marginTop: 80 }} />}

        <div className={classes.userRowWrapperMobile}>
          {width < maxMobileWidth && (
            <div style={!user.wallpaperHash ? { marginTop: 10 } : {}} className={classes.userRow}>
              {userInfo}

              {authContext.isAuthenticated &&
                authContext.user?.walletAddress === user?.walletAddress && (
                  <>
                    <div className={classes.userRow_settings}>
                      <Link href="/user/account/settings">
                        <a>
                          <img src="/icons/SettingsIcon.svg" width={25} height={25} alt="" />
                        </a>
                      </Link>
                    </div>
                  </>
                )}
            </div>
          )}
        </div>

        {width < maxMobileWidth && user.about && (
          <div className={classes.userProfile__description}>
            {user.about.length > 30 ? (
              <div
                className={classes.userProfile__about}
                onClick={() => renderUserTextMobileLayout(isUserAboutTextHide)}>
                <div
                  className={`${classes.userProfile__text} ${
                    isUserAboutTextHide
                      ? classes.userProfile__descriptionShow
                      : classes.userProfile__descriptionHide
                  }`}>
                  {userAboutText}
                </div>
                <div className={classes.userProfile__more}>
                  {'   '}
                  {!isUserAboutTextHide ? '...more' : 'less'}
                </div>
              </div>
            ) : (
              <div className={classes.userProfile__about}>{user.about}</div>
            )}
          </div>
        )}

        {!user.photoHash &&
          authContext.isAuthenticated &&
          authContext.user &&
          authContext.user?.walletAddress === user?.walletAddress && (
            <>
              {width > maxMobileWidth && (
                <div className={classes.settingsButtonWithoutPhotoHash}>
                  <LinkList
                    items={[
                      <Link href="/user/account/settings">
                        <a>
                          <span>Account settings</span>
                        </a>
                      </Link>,
                    ]}
                    getItemTitle={(item) => item}
                    getIsActive={() => true}
                  />
                  {collections?.length === 0 && (
                    <LinkList
                      items={[
                        <Link href="/collection/create/">
                          <a>
                            <span>Create collection</span>
                          </a>
                        </Link>,
                      ]}
                      getItemTitle={(item) => item}
                      getIsActive={() => true}
                    />
                  )}
                </div>
              )}
            </>
          )}
      </div>

      {width <= maxMobileWidth &&
        collections?.length === 0 &&
        walletAddress === user.walletAddress && (
          <div className={classes.createButtonMob}>
            <LinkList
              items={[
                <Link href="/collection/create/">
                  <a>
                    <span>Create collection</span>
                  </a>
                </Link>,
              ]}
              getItemTitle={(item) => item}
              getIsActive={() => true}
            />
          </div>
        )}

      {width < maxMobileWidth && collections && collections?.length > 0 && (
        <BigDividerMobile paddingBottom="40px" paddingTop="40px" />
      )}

      {isDesktopWidth && (
        <div className="grid-button-right" style={{ marginTop: 50 }}>
          <CreateTokenButton />
        </div>
      )}

      {collections && collections?.length > 0 && (
        <div className={classes.collectionsWrapper}>
          <div className={classes.collectionsWrapper_titleRow}>
            <Title>Collections</Title>
            {authContext?.user?.walletAddress === user?.walletAddress && (
              <LinkList
                className={classes.collectionsWrapper_titleRow_link}
                items={[
                  <Link href="/collection/create/">
                    <a>
                      <span>Create collection</span>
                    </a>
                  </Link>,
                ]}
                getItemTitle={(item) => item}
                getIsActive={() => true}
              />
            )}
          </div>

          {collections && (
            <>
              <CollectionCardWrapper collections={collections} users={[user]} />
              <div className={classes.paginationWrap}>
                <div className={classes.paginationSection}>
                  <Pagination
                    current={pageCollection}
                    defaultCurrent={1}
                    defaultPageSize={8}
                    pageSize={limitCollection}
                    total={collectionCount}
                    onChange={(page, pageSize) => {
                      window.scroll({ top: 300, behavior: 'smooth' });
                      if (pageSize && pageSize !== limitCollection) {
                        setLimitCollection(pageSize);
                      } else {
                        setPageCollection(page);
                      }
                    }}
                    showQuickJumper
                  />
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {width < maxMobileWidth && collections && (
        <BigDividerMobile paddingBottom="15px" paddingTop="40px" />
      )}
      <Gallery
        filter={
          currentFilterKey === 'Tokens'
            ? { owner: user?.walletAddress }
            : { creator: user?.walletAddress }
        }
        filterConst={tokenAffiliationFilters}
        defaultLimit={20}
        filterConstDefault={DEFAULT_TOKEN_AFFILIATION_FILTER_KEY}
        setCurrentFilterKeyProps={setCurrentFilterKey}
        usersProps={[user]}
      />
    </React.Fragment>
  );
};

export default UserPage;
