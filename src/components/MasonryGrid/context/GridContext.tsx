import React, { ReactNode } from 'react';

export const GridContext = React.createContext<GridContextValue>({
  gutter: 0,
  columnWidth: 0,
  rowHeight: 0,
});

interface GridContextValue {
  gutter: number;
  columnWidth: number;
  rowHeight: number;
}

export const GridContextProvider = ({ children, value }: Props) => (
  <GridContext.Provider value={value}>{children}</GridContext.Provider>
);

interface Props {
  children: ReactNode;
  value: GridContextValue;
}
