import React, { ChangeEventHandler, DetailedHTMLProps, InputHTMLAttributes } from 'react';
import classes from './index.module.scss';
import cn from 'classnames';

const Input = ({ value, onChange, ...props }: Props) => {
  return <input {...props} className={cn(classes.input, props.className)} />;
};

export interface Props
  extends DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement> {
  value?: string;
  onChange?: ChangeEventHandler<HTMLInputElement>;
}

export default Input;
