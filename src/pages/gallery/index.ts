import dynamic from 'next/dynamic';
import ServerSideMetaTags from '../../utils/ServerSideMetaTags';

const TokensPage = dynamic(() => import('../../features/Token/pages/TokensPage'), {
  ssr: true,
});

export async function getServerSideProps() {
  const meta = await ServerSideMetaTags.getMetaData('gallery');

  return {
    props: { meta },
  };
}

export default TokensPage;
