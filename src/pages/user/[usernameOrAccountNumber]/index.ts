import dynamic from 'next/dynamic';

const UserPage = dynamic(() => import('../../../features/User/pages/UserPage'), {
  ssr: false,
});

export default UserPage;
