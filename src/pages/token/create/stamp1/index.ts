import dynamic from 'next/dynamic';

const CreateStampPage = dynamic(() => import('../../../../features/Token/pages/TokenPageCreate'), {
  ssr: false,
});

export default CreateStampPage;
