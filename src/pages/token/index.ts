import dynamic from 'next/dynamic';

const TokensPage = dynamic(() => import('../../features/Token/pages/TokensPage'), {
  ssr: false,
});

export default TokensPage;
