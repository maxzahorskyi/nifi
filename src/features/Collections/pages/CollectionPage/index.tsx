import React, { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import getMediaUrl from '../../../../utils/getMediaUrl';
import classes from './index.module.scss';
import LinkList from '../../../../components/LinkList';
import { useCollection } from '../../../../hooks/collections';
import { GQLCollection, GQLUser } from '../../../../types/graphql.schema';
import { Skeleton } from 'antd';
import UserLink from '../../../../components/UserLink';
import Link from 'next/link';
import useWindowDimensions from '../../../../hooks/useWindowDimensions';
import BigDividerMobile from '../../../../components/BigDividerMobile';
import { useUser } from '../../../../hooks/users';
import useAuthContext from '../../../../hooks/useAuthContext';
import getConfig from 'next/config';
import Loader from '../../../../components/Loader';
import Gallery from '../../../Token/pages/TokensPage/Gallery';
import MetaTags from '../../../Token/components/MetaTags';

const CollectionPage = () => {
  const router = useRouter();
  const authContext = useAuthContext();
  const identifier = router.query.collectionId;
  const { width, maxMobileWidth } = useWindowDimensions();
  const [collection, setCollection] = useState<GQLCollection | undefined>(undefined);
  const [creator, setCreator] = useState<GQLUser | undefined>();
  const [userAboutText, setUserAboutText] = useState<string>('');
  const [isUserAboutTextHide, setIsUserAboutTextHide] = useState<boolean>(true);

  const config = getConfig();
  const imgUrl = config.publicRuntimeConfig.services.mediaUrl;
  const userId = creator?.username ?? creator?.accountNumber;

  const wallpaper = collection?.raw?.media?.find(({ role }: any) => role === 'wallpaper');
  const avatar = collection?.raw?.media?.find(({ role }: any) => role === 'avatar');

  useCollection({
    skipQuery: !identifier,
    fetchPolicy: 'network-only',
    variables: { query: { collectionID: identifier } },
    onSuccess: (collection) => {
      setCollection(collection);
    },
    onError: (error) => console.error(error),
  });
  useUser({
    skipQuery: !collection?.raw?.creator,
    variables: { query: { walletAddress: collection?.raw?.creator } },
    onSuccess: (data) => {
      setCreator(data.user);
    },
    onError: (error) => console.error(error),
  });

  useEffect(() => renderUserTextMobileLayout(true), [collection]);
  const renderUserTextMobileLayout = useCallback(
    (hide: boolean) => {
      setIsUserAboutTextHide(!hide);
      if (hide) {
        setUserAboutText(`${collection?.raw?.about?.substring(0, width - width / 2)}   ...`);
      } else {
        setUserAboutText(collection?.raw?.about || '');
      }
    },
    [width, collection],
  );

  if (!collection) return <Loader text="The collection is being loaded" />;

  return (
    <>
      <MetaTags
        title={collection?.raw?.title}
        description={collection?.raw?.about}
        image={avatar?.hash}
      />
      <div className={classes.collectionWrapper}>
        <div
          className={classes.wallpaperWrapper}
          style={{
            backgroundImage: `url(${imgUrl}/${wallpaper?.hash})`,
            backgroundPosition: 'center',
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
          }}
        />

        <div className={classes.rowWrapper}>
          <div className={classes.avatarAndTitle}>
            {avatar?.hash && (
              <div className={classes.avatarAndTitle_avatar}>
                <div
                  className={classes.avatarAndTitle_avatarImage}
                  style={{
                    backgroundImage: `url(${imgUrl}/${avatar?.hash})`,
                    backgroundPosition: 'center',
                    backgroundSize: 'cover',
                    backgroundRepeat: 'no-repeat',
                  }}
                />
                {/*<img src={getMediaUrl(avatar?.hash, 'image')} loading="lazy" />{' '}*/}
              </div>
            )}

            {width <= maxMobileWidth && (
              <div className={classes.creator}>
                <UserLink userId={userId} className={classes.creator__info}>
                  {creator?.avatarHash ? (
                    <img
                      className={classes.avatar}
                      alt="creator avatar"
                      src={getMediaUrl(creator.avatarHash, 'image', {
                        width: 80,
                        height: 80,
                        compressionQuality: 70,
                      })}
                      width={80}
                      height={80}
                      style={{ objectFit: 'cover' }}
                      loading="lazy"
                    />
                  ) : (
                    <Skeleton.Avatar size={80} />
                  )}

                  <div className={classes.creator_userInfo}>
                    <span className={classes.creator__nickname}>{creator?.nickname}</span>
                    <span className={classes.creator__username}>@{creator?.username}</span>
                  </div>
                </UserLink>
              </div>
            )}
            <div className={classes.avatarAndTitle_title}>{collection?.raw?.title}</div>
          </div>

          {authContext.isAuthenticated &&
            authContext.user &&
            authContext.user?.walletAddress === creator?.walletAddress && (
              <div className={classes.rowWrapper_collectionSettings}>
                <LinkList
                  items={[
                    <Link href={`/collection/${collection?.collectionID}/settings`}>
                      <span>Collection settings</span>
                    </Link>,
                  ]}
                  getItemTitle={(item) => item}
                  getIsActive={() => true}
                />
              </div>
            )}
        </div>
      </div>
      <div className={classes.descriptionAndUser}>
        {width > maxMobileWidth && (
          <div className={classes.creator}>
            <UserLink userId={userId} className={classes.creator__info}>
              {creator?.avatarHash ? (
                <img
                  className={classes.avatar}
                  alt="creator avatar"
                  src={getMediaUrl(creator.avatarHash, 'image', {
                    width: 80,
                    height: 80,
                    compressionQuality: 70,
                  })}
                  width={80}
                  height={80}
                  style={{ objectFit: 'cover' }}
                />
              ) : (
                <Skeleton.Avatar size={80} />
              )}
              {creator && (
                <div className={classes.creator_userInfo}>
                  <span className={classes.creator__nickname}>{creator?.nickname}</span>
                  <span className={classes.creator__username}>@{creator?.username}</span>
                </div>
              )}
            </UserLink>
          </div>
        )}

        {width <= maxMobileWidth ? (
          <div
            className={classes.about}
            onClick={() => renderUserTextMobileLayout(isUserAboutTextHide)}>
            <div
              className={`${
                isUserAboutTextHide ? classes.about_descriptionShow : classes.about_descriptionHide
              }`}>
              {userAboutText}
            </div>
            <div className={classes.about_more}>
              {'   '}
              {!isUserAboutTextHide ? '...more' : 'less'}
            </div>
          </div>
        ) : (
          <div className={classes.about}> {collection?.raw?.about}</div>
        )}
      </div>
      {width <= maxMobileWidth && <BigDividerMobile paddingBottom={40} paddingTop={40} />}
      <div className={classes.tokensWrapper}>
        <Gallery
          title="Collection"
          defaultLimit={20}
          filter={{ collectionID: collection.collectionID }}
          usersProps={[creator]}
        />
      </div>
    </>
  );
};

export default CollectionPage;
