import React from 'react';
import Masonry, { ResponsiveMasonry } from 'react-responsive-masonry';

type Props = {
  gutter?: string;
  theme: boolean;
  children: JSX.Element[];
};

const MasonryWrapper = ({ gutter = '16px', theme, children }: Props) => {
  return (
    <ResponsiveMasonry
      columnsCountBreakPoints={{
        0: theme ? 1 : 1,
        450: theme ? 1 : 1,
        550: theme ? 1 : 2,
        600: theme ? 2 : 2,
        900: theme ? 3 : 3,
        1000: 3,
        1200: 3,
        1300: 4,
      }}>
      <Masonry gutter={gutter}>{children}</Masonry>
    </ResponsiveMasonry>
  );
};

export default MasonryWrapper;
