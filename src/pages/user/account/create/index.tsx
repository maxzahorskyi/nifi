import dynamic from 'next/dynamic';

const UserCreatePage = dynamic(() => import('../../../../features/User/pages/UserCreatePage'), {
  ssr: false,
});

export default UserCreatePage;
