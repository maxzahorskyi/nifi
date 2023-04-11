import TokenPage from '../../../../features/Token/pages/TokenPage';
import { GetServerSidePropsContext } from 'next';
import ServerSideMetaTags from '../../../../utils/ServerSideMetaTags';

export const getServerSideProps = async (context: GetServerSidePropsContext) => {
  const meta = await ServerSideMetaTags.getMetaDataTokenPage(context);

  return {
    props: { meta },
  };
};

export default TokenPage;
