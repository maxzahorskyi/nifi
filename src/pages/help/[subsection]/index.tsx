import { useRouter } from 'next/router';
import ContentfulSectionAddress from '../../../components/ContentfulSectionAddress';
import React from 'react';

const Wrapper = () => {
  const router = useRouter();
  return <ContentfulSectionAddress routerFromSubsection={router} sectionAddress="help" />;
};

export default Wrapper;
