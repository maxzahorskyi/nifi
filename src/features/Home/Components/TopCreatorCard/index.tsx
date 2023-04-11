import React from 'react';
import classes from './index.module.scss';
import getMediaUrl from '../../../../utils/getMediaUrl';
import getCorrectImageUrl from '../../../../utils/GetCorrectImageUrlUtil';
import { GQLUser } from '../../../../types/graphql.schema';

const TopCreatorCard = ({
  card: { avatarHash, wallpaperHash, nickname, username },
  image,
  creationsNumber,
  likesCount,
}: Props) => {
  return (
    <div
      className={classes.userWallpaper}
      style={{
        backgroundImage: `url('${
          image ? getCorrectImageUrl(image) : getMediaUrl(wallpaperHash || '', 'image')
        }')`,
      }}>
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
      <div className={classes.hoveredBlock}>
        <div className={classes.userInfo} style={{ maxWidth: 240, position: 'absolute' }}>
          <div className={classes.userInfo_nickname}>{nickname}</div>
          <div className={classes.userInfo_username}>@{username}</div>
          <ul>
            <li>{creationsNumber || 45} creations</li>
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
  card: GQLUser;
  image: string | undefined;
  creationsNumber: number | undefined;
  likesCount: number | 0;
}

export default TopCreatorCard;
