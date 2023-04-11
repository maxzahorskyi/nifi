import React, { useEffect, useState } from 'react';
import classes from './index.module.scss';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { urls } from '../../types/pages';

const menuList = [
  {
    icon: '/icons/CreationSignIcon.svg',
    text: 'Create your token',
    link: urls.tokenCreate.default,
  },
  {
    icon: '/icons/SettingsSign.svg',
    text: 'Account settings',
    link: '/user/account/settings',
  },
];

const MobileUnderMenu = () => {
  const router = useRouter();
  const [menuDisplayList, setMenuDisplayList] = useState(menuList);
  const [cancelMenuText, setCancelMenuText] = useState('');
  useEffect(() => {
    switch (router.pathname) {
      case urls.tokenCreate.default: {
        setMenuDisplayList([]);
        setCancelMenuText('Token creation');
        break;
      }
      case '/action/setup': {
        setMenuDisplayList([]);
        setCancelMenuText('Auction creation');
        break;
      }
      case '/collection/create': {
        setMenuDisplayList([]);
        setCancelMenuText('Collection creation');
        break;
      }
      case '/token/create/art2': {
        setMenuDisplayList([]);
        setCancelMenuText('Series creation');
        break;
      }
      case '/token/create/collectible': {
        setMenuDisplayList([]);
        setCancelMenuText('Token creation');
        break;
      }
      case '/token/create/stamp1': {
        setMenuDisplayList([]);
        setCancelMenuText('Token creation');
        break;
      }
      case '/token/create/seal': {
        setMenuDisplayList([]);
        setCancelMenuText('Token creation');
        break;
      }
      case '/token/create/4ever': {
        setMenuDisplayList([]);
        setCancelMenuText('Token creation');
        break;
      }
      case '/collection/[collectionId]/settings': {
        setMenuDisplayList([]);
        setCancelMenuText('Collection update');
        break;
      }
      case '/': {
        setMenuDisplayList([
          {
            icon: '/icons/CreationSignIcon.svg',
            text: 'Create your token',
            link: urls.tokenCreate.default,
          },
          {
            icon: '/icons/SettingsSign.svg',
            text: 'Account settings',
            link: '/user/account/settings',
          },
        ]);
        setCancelMenuText('');
        break;
      }
      default:
        setMenuDisplayList(menuList);
        setCancelMenuText('');
    }
  }, [router]);
  return !cancelMenuText && menuDisplayList.length !== 0 ? (
    <div className={classes.container}>
      <div className={classes.menu}>
        {menuDisplayList.map((item, index) => (
          <Link href={item.link} key={index}>
            <div className={classes.menuItem}>
              <img src={item.icon} alt="" width={0} />
              <div className={classes.text}>{item.text}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  ) : (
    <div className={classes.cancelMenu}>
      <div className={classes.cancelMenu__item}>{cancelMenuText}</div>
      <div className={classes.cancelMenu__closeIcon} onClick={() => router.back()}>
        <img src="/icons/CloseIcon.svg" alt="" />
      </div>
    </div>
  );
};

MobileUnderMenu.propTypes = {};

export default MobileUnderMenu;
