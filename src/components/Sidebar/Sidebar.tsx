import React, { useState } from 'react';
import { slide as Menu } from 'react-burger-menu';
import classes from '../Header/index.module.scss';
import LinkButton from '../LinkButton';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/router';

const styles = {
  bmBurgerButton: {
    position: 'relative',
    width: '31px',
    height: '31px',
    marginLeft: 21,
  },
  bmBurgerBars: {
    background: '#373a47',
  },
  bmBurgerBarsHover: {
    background: '#a90000',
  },
  bmCrossButton: {
    height: '24px',
    width: '24px',
  },
  bmCross: {
    background: '#bdc3c7',
  },
  bmMenuWrap: {
    position: 'fixed',
    height: '100vh',
    left: 0,
    top: 51,
  },
  bmMenu: {
    background: 'white',
    padding: '37px 18px 0',
    fontSize: '1.15em',
  },
  bmMorphShape: {
    fill: '#373a47',
  },
  bmItemList: {
    color: '#b8b7ad',
  },
  bmItem: {
    display: 'inline-block',
  },
  bmOverlay: {
    background: 'rgba(0, 0, 0, 0.3)',
    left: 0,
    top: 51,
    height: '100vh',
  },
};

const Sidebar = (props: any) => {
  const [isModalOpen, setOpen] = useState(false);
  const { t } = useTranslation();
  const router = useRouter();

  const linkButtons = [
    { title: t('Header.Home'), href: '/' },
    { title: t('Header.Collections'), href: '/collections' },
    { title: t('Header.Gallery'), href: '/gallery' },
    { title: t('Header.Activity'), href: '/activity' },
  ];

  const supportLinkButtons = [
    { title: t('Header.Language'), href: '/', supportLink: true },
    {
      title: t('Header.AccountSettings'),
      href: '/user/account/settings',
      supportLink: true,
    },
    { title: t('Header.TermsOfService'), href: '/help', supportLink: true },
    { title: t('Header.PrivacyPolicy'), href: '/help/faq', supportLink: true },
  ];

  const isLinkActive = (href: string) => {
    return router.pathname === href;
  };

  const handleOpen = () => {
    document.body.style.overflow = 'hidden';
    setOpen(true);
  };

  const handleClose = () => {
    document.body.style.overflow = 'unset';
    setOpen(false);
  };
  return (
    // Pass on our props
    <Menu
      {...props}
      styles={styles}
      isOpen={isModalOpen}
      onOpen={handleOpen}
      onClose={handleClose}
      customBurgerIcon={<img src="/icons/HeaderMenuIcon.svg" />}>
      <div className={classes.linkButtons}>
        {linkButtons.map(({ title, href }, index) => {
          return (
            <div className={`${classes.linkButtons__button}`} key={index} onClick={handleClose}>
              <LinkButton title={title} href={href} isActive={isLinkActive(href)} />
            </div>
          );
        })}

        <div style={{ marginTop: 50 }} />
        {supportLinkButtons.map(({ title, href }, index) => {
          return (
            <div
              className={`${classes.linkButtons__buttonSupportLink}`}
              key={index}
              onClick={handleClose}>
              <LinkButton title={title} href={href} isActive={isLinkActive(href)} />
            </div>
          );
        })}
      </div>
    </Menu>
  );
};
export default Sidebar;
