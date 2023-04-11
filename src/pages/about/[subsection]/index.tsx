import React from 'react';
import { useRouter } from 'next/router';
import ContentfulSectionAddress from '../../../components/ContentfulSectionAddress';

const Wrapper = () => {
  const router = useRouter();
  return <ContentfulSectionAddress routerFromSubsection={router} sectionAddress="about" />;
};

export default Wrapper;
