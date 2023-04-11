import dynamic from 'next/dynamic';
import ServerSideMetaTags from '../../utils/ServerSideMetaTags';

const CollectionsPage = dynamic(() => import('../../features/Collections'), {
  ssr: true,
});

export async function getServerSideProps() {
  const meta = await ServerSideMetaTags.getMetaData('collections');

  return {
    props: { meta },
  };
}

export default CollectionsPage;
