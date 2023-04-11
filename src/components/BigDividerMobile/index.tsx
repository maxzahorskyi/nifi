import React from 'react';
import classes from './index.module.scss';

const BigDividerMobile = ({
  paddingBottom,
  paddingTop,
}: {
  paddingBottom?: number | string | undefined;
  paddingTop?: number | string | undefined;
}) => {
  return (
    <div
      className={`${classes.bigDividerWrapper}`}
      style={{ paddingBottom: paddingBottom || '37px', paddingTop: paddingTop || 0 }}>
      <div className={`${classes.bigDivider}`} />
    </div>
  );
};

export default BigDividerMobile;
