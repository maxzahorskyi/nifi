import React, { DetailedHTMLProps, HTMLAttributes } from 'react';
import View from '../../types/View';
import classes from './index.module.scss';
import cn from 'classnames';

const Container = ({ children, ...props }: Props) => {
  return (
    <div {...props} className={cn(classes.container, props.className)}>
      {children}
    </div>
  );
};

interface Props extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
  children: View;
}

export default Container;
