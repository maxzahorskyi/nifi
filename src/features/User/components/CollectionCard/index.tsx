import React, { useEffect } from 'react';
import classes from './index.module.scss';
import getMediaUrl from '../../../../utils/getMediaUrl';
import { useQuery as useGqlQuery } from '@apollo/client/react/hooks/useQuery';
import { getTokens } from '../../../../gql/query/token';
import Link from 'next/link';
import { Skeleton } from 'antd';

const CollectionCard = ({
  wallpaperHash,
  avatarHash,
  title,
  creationsNumber,
  userLink,
  likesCount = 0,
}: Props) => {
  const { data: tokensData } = useGqlQuery(getTokens, {
    errorPolicy: 'ignore',
    variables: {
      query: {
        raw: { collectionID: creationsNumber },
        tokenID_exists: true,
      },
    },
  });

  return (
    <div className={classes.collectionCard}>
      {wallpaperHash ? (
        <img
          className={classes.wallpaper}
          src={getMediaUrl(wallpaperHash || '', 'image', {
            width: 300,
            height: 300,
            compressionQuality: 70,
          })}
          alt=""
        />
      ) : (
        <div style={{ width: '100%', height: '100%', backgroundColor: '#EEE' }} />
      )}
      <Link href={`/user/${userLink}`}>
        <a>
          <div
            className={classes.userAvatar}
            style={{
              backgroundImage: `url('${
                avatarHash &&
                getMediaUrl(avatarHash, 'image', {
                  width: 80,
                  height: 80,
                  compressionQuality: 70,
                })
              }')`,
            }}>
            <div className={classes.borderedAvatar} />
          </div>
        </a>
      </Link>
      <div className={classes.hoveredBlock}>
        <div className={classes.collectionInfo}>
          <div className={classes.title}>{title}</div>
          <ul>
            <li>{tokensData?.tokens?.length} creations</li>
            <li>
              {likesCount} {likesCount === 1 ? 'like' : 'likes'}
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

interface Props {
  avatarHash: string;
  wallpaperHash?: string;
  title: string;
  creationsNumber?: any;
  userLink?: string | number | undefined;
  likesCount?: number;
}

export default CollectionCard;
