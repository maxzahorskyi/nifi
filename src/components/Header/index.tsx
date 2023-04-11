import React, { useEffect, useCallback } from 'react';
import classes from './index.module.scss';
import LinkButton from '../LinkButton';
import Container from '../Container';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import useImageUrl from '../../hooks/useImageUrl';
import useAuthContext from '../../hooks/useAuthContext';
import useWindowDimensions from '../../hooks/useWindowDimensions';
import { Skeleton } from 'antd';
import { toFormatWalletAddress } from '../../utils/toFormatWalletAddress';
import Sidebar from '../Sidebar/Sidebar';
import StickyContainer from '../StickyContainer/index';
import HeaderWalletsModal from '../HeaderWalletsModal';
import HeaderModals from '../HeaderModals';
import BlockchainIcon from '../BlockchainIcon';

const Header = (props: Props) => {
  const router = useRouter();
  const { t } = useTranslation();
  const { user, isAuthenticated, wallets, walletAddress, blockchain } = useAuthContext();
  const avatar = useImageUrl(user?.avatarHash || '', {
    width: 31,
    height: 31,
    compressionQuality: 70,
  });
  const { width, maxMobileWidth } = useWindowDimensions();
  const [isWarningModal, setWarningModal] = React.useState<boolean>(false);

  //ton surf form
  const [isTonSurfOpen, setTonSurfOpen] = React.useState<boolean>(false);

  const linkButtons = [
    { title: t('Header.Home'), href: '/' },
    { title: t('Header.Collections'), href: '/collections' },
    { title: t('Header.Gallery'), href: '/gallery' },
    { title: t('Header.Activity'), href: '/activity' },
  ];
  const isLinkActive = (href: string) => {
    return router.pathname === href;
  };

  const logoWidth = useCallback(() => {
    return width <= maxMobileWidth ? 94 : 161;
  }, [width]);

  const renderAvatar = () => {
    if (user?.avatarHash === null) {
      return <Skeleton.Avatar />;
    }

    if (user?.avatarHash !== undefined) {
      return (
        <img
          src={avatar}
          alt="avatar"
          width={30}
          height={30}
          style={{
            borderRadius: '100%',
          }}
        />
      );
    }

    return (
      <img
        src="/icons/person.svg"
        alt="avatar"
        className={classes.personIcon}
        width={28}
        height={28} // 28px
      />
    );
  };

  let userLink = '/user/';

  if (user && Object.keys(user).length > 1) {
    userLink += user?.username;
  } else {
    userLink += 'account/create';
  }

  return (
    <>
      <StickyContainer>
        <div className={`${classes.bg}`}>
          <Container className={classes.wrap}>
            <div className={classes.content}>
              <div className={classes.header} id="header">
                <div className={classes.logoWrapper} id="page-wrap">
                  <Link href="/">
                    <a>
                      <img
                        className={classes.logo}
                        src="/images/logo.svg"
                        alt="Nifi"
                        width="auto"
                        height={logoWidth() < 161 ? 20 : 30}
                      />
                    </a>
                  </Link>
                  <span style={{ zIndex: 10 }}>{width <= maxMobileWidth && <Sidebar />}</span>
                </div>

                <div className={classes.header__navigations}>
                  {width > maxMobileWidth && (
                    <div className={classes.linkButtons}>
                      {linkButtons.map(({ title, href }, index) => {
                        return (
                          <div className={classes.linkButtons__button} key={index}>
                            <LinkButton title={title} href={href} isActive={isLinkActive(href)} />
                          </div>
                        );
                      })}
                    </div>
                  )}
                  <div className={classes.linkIcons}>
                    {wallets && Object.keys(wallets).find((item) => wallets[item]?.hasProvider) && (
                      <div className={classes.walletWrap}>
                        <HeaderWalletsModal handlers={{ setTonSurfOpen }} />
                        {walletAddress && walletAddress.length && blockchain && (
                          <>
                            <BlockchainIcon blockchain={blockchain} style={{ marginLeft: 6 }} />
                            <span style={{ marginLeft: '6px' }}>
                              {toFormatWalletAddress(walletAddress)}
                            </span>
                          </>
                        )}
                      </div>
                    )}
                    {walletAddress ? (
                      <Link href={userLink}>
                        <a className={classes.linkIcons__icon}>{renderAvatar()}</a>
                      </Link>
                    ) : (
                      <div
                        className={classes.linkIcons__icon}
                        onClick={() => setWarningModal(true)}>
                        {renderAvatar()}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Container>
        </div>
      </StickyContainer>
      <div style={{ marginBottom: width > maxMobileWidth ? 72 : 51 }} />
      <HeaderModals
        handlers={{ setTonSurfOpen, setWarningModal }}
        states={{ isTonSurfOpen, isWarningModal }}
      />
    </>
  );
};

export default Header;

interface Props {}
