import React from 'react';
import ContentfulSectionAddress from '../../../../components/ContentfulSectionAddress';

const AboutPage = ({ routerFromSubsection }: any) => {
  return (
    <ContentfulSectionAddress routerFromSubsection={routerFromSubsection} sectionAddress="about" />
  );
};

export default AboutPage;
