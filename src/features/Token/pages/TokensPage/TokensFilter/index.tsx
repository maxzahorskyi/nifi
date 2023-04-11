import React from 'react';
import classes from './index.module.scss';

const TokensFilter = <T,>(props: Props<T>) => {
  const { filters, getTitle, getAction } = props;

  return (
    <div className={classes.filter}>
      {filters.map((filter) => {
        return <span className={classes.filter__item}>{getTitle(filter)}</span>;
      })}
    </div>
  );
};

export default TokensFilter;

interface Props<T> {
  filters: T[];
  getTitle: (item: T) => string;
  getAction?: (item: T) => any;
}
