import dynamic from 'next/dynamic';

const CreateCollectiblePage = dynamic(
  () => import('../../../../features/Token/pages/CollectiblePageCreate'),
  {
    ssr: false,
  },
);

export default CreateCollectiblePage;
