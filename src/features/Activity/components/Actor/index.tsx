import React, { useState } from 'react';
import getMediaUrl from '../../../../utils/getMediaUrl';
import { Skeleton } from 'antd';
import AddressUtil from '../../../../utils/AddressUtil';
import UserLink from '../../../../components/UserLink';
import { useUser } from '../../../../hooks/users';
import { GQLUser } from '../../../../types/graphql.schema';
import classes from '../../pages/ActivityPage/index.module.scss';

const Actor = ({ address }: Props) => {
  const [actor, setActor] = useState<GQLUser | undefined>();

  useUser({
    skipQuery: false,
    variables: {
      query: {
        walletAddress: address,
      },
    },
    onSuccess: (data) => setActor(data.user),
    onError: (e) => console.log(e),
  });

  return (
    <UserLink
      userId={actor?.username ?? actor?.accountNumber ?? address}
      className={classes.userLink}>
      <span className={classes.userInfoRow}>
        {actor?.avatarHash ? (
          <img
            src={getMediaUrl(actor.avatarHash, 'image', {
              width: 40,
              height: 40,
              compressionQuality: 70,
            })}
            width={40}
            height={40}
            style={{ borderRadius: '50%', objectFit: 'cover' }}
          />
        ) : (
          <Skeleton.Avatar size={40} />
        )}

        <div className={classes?.userName}>{actor?.nickname ?? AddressUtil.shorten(address)}</div>
      </span>
    </UserLink>
  );
};

export default Actor;

interface Props {
  address: string;
}
