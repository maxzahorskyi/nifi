import dynamic from 'next/dynamic';

const HelpPage = dynamic(() => import('../../features/Help/pages/HelpPage'), {
  ssr: false,
});

export default HelpPage;
