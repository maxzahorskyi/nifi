import React, { ButtonHTMLAttributes, DetailedHTMLProps } from 'react';
import View from '../../types/View';
import classes from './index.module.scss';
import cn from 'classnames';

const TextButton = ({ children, className, ...restProps }: Props) => {
  return (
    <button {...restProps} className={cn(classes.button, className)}>
      {children}
    </button>
  );
};

interface Props
  extends DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> {
  children: View;
}

export default TextButton;
