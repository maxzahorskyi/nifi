import React, { DetailedHTMLProps, HTMLAttributes } from 'react';
import classes from './index.module.scss';
import View from '../../types/View';
import cn from 'classnames';

const Title = (props: Props) => {
  const { children, className, ...restProps } = props;
  return (
    <>
      <span {...restProps} className={cn(classes.title, className)}>
        {children}
      </span>
    </>
  );
};

export default Title;

interface Props extends DetailedHTMLProps<HTMLAttributes<HTMLSpanElement>, HTMLSpanElement> {
  children: View;
}
