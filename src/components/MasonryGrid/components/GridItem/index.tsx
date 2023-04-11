import React, { useRef, useContext, useEffect, ReactNode, ReactElement } from 'react';

import { GridContext } from '../../context/GridContext';

const GridItem = ({ children }: Props) => {
  const gridItemRef = useRef<HTMLDivElement>(null);
  const gridItemWrapper = useRef<HTMLDivElement>(null);
  const gridContext = useContext(GridContext);

  const itemLoaded = () => {
    if (!gridItemRef.current || !gridItemWrapper.current) {
      return;
    }

    const refHeight = gridItemRef.current.clientHeight;
    const refWidth = gridItemRef.current.clientWidth;

    const { columnWidth, rowHeight, gutter: rowGap } = gridContext;

    const desiredHeight = (columnWidth * refHeight) / refWidth;
    const rowSpan = Math.ceil((desiredHeight + rowGap) / rowHeight);

    gridItemWrapper.current.style.height = `${desiredHeight}px`;
    gridItemWrapper.current.style.width = `${columnWidth}px`;
    gridItemWrapper.current.style.gridRowEnd = `span ${rowSpan}`;
  };

  useEffect(itemLoaded, []);

  return (
    <div ref={gridItemWrapper} style={{ width: `${gridContext.columnWidth}px` }}>
      <div ref={gridItemRef} onLoad={itemLoaded}>
        {React.cloneElement(children, { masonryGridItem: { forceRender: itemLoaded } })}
      </div>
    </div>
  );
};

interface Props {
  children: ReactElement;
}

export interface MasonryGridItemChildrenProps {
  masonryGridItem?: {
    forceRender: () => void;
  };
}

export default GridItem;
