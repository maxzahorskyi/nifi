import React, { useEffect, useState } from 'react';
import classes from './index.module.scss';
import { GQLCollection, GQLUser } from '../../../../types/graphql.schema';
import CollectionCard from './index';
import Link from 'next/link';
import { totalLikes, useLikes } from '../../../../hooks/likes/likes';

const CollectionCardWrapper = ({ collections, users }: Props) => {
  const [likesData, setLikesData] = useState<{ [key: string]: totalLikes }>({});
  const { getGroupLikesBycollectionIDs } = useLikes();

  useEffect(() => {
    let collectionIDs = collections.map((collection) => collection.collectionID || '');
    getGroupLikesBycollectionIDs({
      collectionIDs,
      onSuccess: (data: any) => setLikesData(data),
    });
  }, [collections]);

  const getUser = (walletAddress: string) =>
    users?.find(({ walletAddress: string }) => string === walletAddress);
  return (
    collections && (
      <div className={classes.collectionCardWrapper}>
        {collections.map((collection, index) => {
          const wallpaperHash = collection?.raw?.media?.find(
            ({ role }: any) => role === 'avatar',
          )?.hash;
          const user = getUser(collection?.raw?.creator || '');
          return (
            <a href={`/collection/${collection?.collectionID}`} key={index}>
              {collection?.raw?.title && collection?.raw?.creator && (
                <CollectionCard
                  avatarHash={user?.avatarHash || ''}
                  wallpaperHash={wallpaperHash}
                  title={collection?.raw?.title}
                  creationsNumber={collection?.collectionID}
                  userLink={user?.username ?? user?.accountNumber}
                  likesCount={
                    // collection?.collectionID ? likesData[collection.collectionID]?.totalLikes : 0
                    0
                  }
                />
              )}
            </a>
          );
        })}
      </div>
    )
  );
};

interface Props {
  collections: GQLCollection[];
  users: GQLUser[];
}

export default CollectionCardWrapper;
