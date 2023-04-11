import React from 'react';
import classes from './index.module.scss';
import LinkList from '../../../../components/LinkList';
import Button from '../../../../components/Button';
import { useRouter } from 'next/router';
import Link from 'next/link';
import useAuthContext from '../../../../hooks/useAuthContext';
import useImageUrl from '../../../../hooks/useImageUrl';
import { UserOutlined } from '@ant-design/icons';
import { Avatar } from 'antd';
import useWindowDimensions from '../../../../hooks/useWindowDimensions';
import { urls } from '../../../../types/pages';
import CreateTokenButton from '../../../Activity/components/CreateTokenButton';

const Navigation = <T,>(props: Props<T>) => {
  const { links, getIsActive, getItemTitle, getPath, tokenPageCreate } = props;
  const router = useRouter();
  const { width: innerWindowWidth, maxMobileWidth } = useWindowDimensions();
  const { user } = useAuthContext();
  const avatar = useImageUrl(user?.avatarHash, { width: 73, height: 73 });

  return (
    <div className={classes.navigation}>
      {innerWindowWidth > maxMobileWidth && (
        <div className={classes.buttonWrap}>
          <CreateTokenButton />
        </div>
      )}
      <div className={classes.avatarWrap}>
        <div className={classes.navigation__avatar}>
          {avatar ? (
            <img
              src={avatar}
              alt="avatar"
              width={73}
              height={73}
              style={{
                borderRadius: '100%',
              }}
            />
          ) : (
            <Avatar size={73} icon={<UserOutlined />} />
          )}
        </div>
        <LinkList
          items={links}
          getItemTitle={(link) => getItemTitle(link)}
          getIsActive={(link) => getIsActive(link)}
          handleItemClick={(link) => router.push(getPath(link))}
        />
      </div>
    </div>
  );
};

export default Navigation;

interface Props<T> {
  links: T[];
  getItemTitle: (item: T) => string;
  getIsActive: (item: T) => boolean;
  getPath: (item: T) => string;
  tokenPageCreate?: boolean;
}
