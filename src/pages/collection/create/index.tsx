import dynamic from 'next/dynamic';

const CreateCollectionPage = dynamic(
  () => import('../../../features/Collections/pages/CreateCollectionPage'),
  {
    ssr: false,
  },
);

export default CreateCollectionPage;
