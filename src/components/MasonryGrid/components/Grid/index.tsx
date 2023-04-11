import React, { CSSProperties, ReactNode } from 'react';
import { GridContextProvider } from '../../context/GridContext';
import classes from './index.module.scss';

const Grid = ({ gutter = 0, columnWidth = 0, rowHeight = 0, children }: Props) => {
  const gridContainerStyle: CSSProperties = {
    gridColumnGap: `${gutter}px`,
    gridRowGap: 0,
    gridTemplateColumns: `repeat(auto-fill, ${columnWidth}px)`,
    gridAutoRows: `${rowHeight}px`,
  };

  return (
    <GridContextProvider value={{ columnWidth, rowHeight, gutter }}>
      <div className={classes.grid} style={gridContainerStyle}>
        {children}
      </div>
    </GridContextProvider>
  );
};

interface Props {
  gutter?: number;
  columnWidth?: number;
  rowHeight?: number;
  children: ReactNode;
}

Grid.defaultProps = {
  gutter: 0,
  columnWidth: 0,
  rowHeight: 0,
};

export default Grid;
