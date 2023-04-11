import dynamic from 'next/dynamic';
import ServerSideMetaTags from '../../utils/ServerSideMetaTags';

const ActivityPage = dynamic(() => import('../../features/Activity/pages/ActivityPage'), {
  ssr: true,
});

export async function getServerSideProps() {
  const meta = await ServerSideMetaTags.getMetaData('activity');

  return {
    props: { meta },
  };
}

export default ActivityPage;
