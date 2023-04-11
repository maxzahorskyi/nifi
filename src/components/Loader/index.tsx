import React from 'react';
import { Spin } from 'antd';
import classes from './index.module.scss';

const Loader = ({ text, size, height = 50 }: Props) => {
  return (
    <div className={classes.loader} style={{ minHeight: `${height}vh` }}>
      <Spin size={size || 'large'} tip={text || ''} />
    </div>
  );
};

export default Loader;

interface Props {
  text?: string;
  size?: 'small' | 'large' | 'default';
  height?: number;
}
