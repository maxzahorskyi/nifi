import React, { useEffect, useState } from 'react';
import LikeIcon from '../../../public/icons/like.svg';
import cn from 'classnames';
import ShareModal from '../ShareModal';
import classes from './index.module.scss';
import { useRouter } from 'next/router';
import { likesData, useLikes } from '../../hooks/likes/likes';
import useAuthContext from '../../hooks/useAuthContext';
import { UserDto } from '../../features/User/UserService';

const LikeBlock = ({
  token,
  shareModal,
  className,
  likeData,
}: {
  token: any;
  shareModal?: boolean;
  className?: any;
  likeData?: likesData;
}) => {
  const initialDataState = { likesCount: 0, hasLike: false };
  const [data, setData] = useState<likesData>(initialDataState);
  const { getLikes, changeLike } = useLikes();
  const { likesCollectionData, user } = useAuthContext();
  const [oldUser, setOldUser] = useState<UserDto | { walletAddress: string }>();

  const router = useRouter();
  const paths = ['/collection/[collectionId]', '/gallery', '/user/[usernameOrAccountNumber]'];

  useEffect(() => {
    if (paths.includes(router.pathname) || !token || user === undefined) return;
    if (user) setOldUser(user);
    if (oldUser?.walletAddress === user?.walletAddress) return;

    getLikes({
      token,
      userAccountNumber: user?.accountNumber,
      walletAddress: user?.walletAddress,
      onSuccess: (data: any) => setData(data),
    });
  }, [user, token]);

  useEffect(() => {
    setData(likeData || initialDataState);
  }, [likeData]);

  useEffect(() => {
    if (likesCollectionData) {
      const objectKey = Object.keys(likesCollectionData)[0] || '';
      const objectValue = Object.values(likesCollectionData)[0] || initialDataState;

      if (objectKey === token?.deployed?.seriesID?.seriesID) {
        setData(objectValue);
      }
    }
  }, [likesCollectionData]);

  return (
    <div className={cn(classes.likeBlock, className)}>
      <LikeIcon
        onClick={() =>
          changeLike({
            token,
            userAccountNumber: user.accountNumber,
            walletAddress: user.walletAddress,
            onSuccess: (data: any) => setData(data),
          })
        }
        className={cn(classes.likeBlock__icon, {
          [classes.likeBlock__icon_active!]: data.hasLike,
        })}
      />
      <p style={{ marginLeft: 12, marginRight: 30 }}>{user !== undefined && data.likesCount}</p>
      {shareModal && <ShareModal token={token} />}
    </div>
  );
};

LikeBlock.propTypes = {};

export default LikeBlock;
