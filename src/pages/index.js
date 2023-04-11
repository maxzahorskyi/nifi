import Home from '../features/Home/pages/HomePage';
import ServerSideMetaTags from '../utils/ServerSideMetaTags';

export async function getServerSideProps() {
  const meta = await ServerSideMetaTags.getMetaData('home');

  return {
    props: { meta },
  };
}

export default Home;
