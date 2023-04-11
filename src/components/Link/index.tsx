import React from 'react';
import classes from './index.module.scss';
import cn from 'classnames';

const LinkComponent = (props: Props) => {
  const { text, className, isActive } = props;

  return (
    <div className={cn(classes.link, className, { [classes.link__active!]: isActive })}>
      <span>{text}</span>
    </div>
  );
};

export default LinkComponent;

interface Props {
  text: string;
  className?: string | undefined;
  isActive?: boolean;
}
