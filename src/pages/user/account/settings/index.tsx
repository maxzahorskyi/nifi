import dynamic from 'next/dynamic';

const UserSettingsPage = dynamic(() => import('../../../../features/User/pages/UserSettingsPage'), {
  ssr: false,
});

export default UserSettingsPage;
