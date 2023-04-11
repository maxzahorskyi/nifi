import React from 'react';
import { useTranslation } from 'react-i18next';
import useAuthContext from '../../../hooks/useAuthContext';
import Navigation from './Navigation';
import AccountSettings from '../pages/UserSettingsPage/AccountSettings';
import View from '../../../types/View';

const NavigationLayout = ({ children, tokenPageCreate }: Props) => {
  const { t } = useTranslation();

  const links = [
    {
      title: t('Navigation.PaymentSettings'),
      isActive: false,
      onClick: console.log,
      href: '/user/payment/settings',
    },
    {
      title: t('Navigation.AccountSettings'),
      isActive: true,
      onClick: console.log,
      href: '/user/account/settings',
    },
  ];

  return (
    <div style={{ marginTop: 60 }}>
      {/*<Navigation*/}
      {/*  tokenPageCreate={tokenPageCreate}*/}
      {/*  links={links}*/}
      {/*  getIsActive={(i) => i.isActive}*/}
      {/*  getItemTitle={(i) => i.title}*/}
      {/*  getPath={(i) => i.href}*/}
      {/*/>*/}
      {children}
    </div>
  );
};

export default NavigationLayout;

interface Props {
  children: View;
  tokenPageCreate?: boolean;
}
