import React from 'react';
import ContentfulSectionAddress from '../../../../components/ContentfulSectionAddress';

const HelpPage = ({ routerFromSubsection }: any) => {
  return (
    <ContentfulSectionAddress sectionAddress="help" routerFromSubsection={routerFromSubsection} />
  );
};

export default HelpPage;
