import React from 'react';
import AccountSettings from './AccountSettings';
import NavigationLayout from '../../components/NavigationLayout';

const UserSettingsPage = (props: Props) => {
  return (
    <NavigationLayout>
      <AccountSettings />
    </NavigationLayout>
  );
};

export default UserSettingsPage;

interface Props {}
