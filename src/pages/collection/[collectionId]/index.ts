import dynamic from 'next/dynamic';

const CollectionPage = dynamic(() => import('../../../features/Collections/pages/CollectionPage'), {
  ssr: false,
});

export default CollectionPage;
