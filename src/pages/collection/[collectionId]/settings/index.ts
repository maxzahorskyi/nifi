import dynamic from 'next/dynamic';

const UpdateCollectionPage = dynamic(
  () => import('../../../../features/Collections/pages/UpdateCollectionPage'),
  {
    ssr: false,
  },
);

export default UpdateCollectionPage;
