import React from 'react';
import classes from './index.module.scss';
import cn from 'classnames';

const TimeTag = (props: Props) => {
  const { time, type, active } = props;
  const tagCn = cn(classes.tag, {
    [classes.tag_primary!]: !type || type === 'primary',
    [classes.tag_secondary!]: type === 'secondary',
  });
  const circleCn = cn(classes.tag__circle, {
    [classes.tag__circle_active!]: active,
  });
  return (
    <div className={tagCn}>
      <div className={circleCn} />
      <span>{time}</span>
    </div>
  );
};

export default TimeTag;

interface Props {
  time?: string | number;
  type?: 'primary' | 'secondary';
  active?: boolean;
}
