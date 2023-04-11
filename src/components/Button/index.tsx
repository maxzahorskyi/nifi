import React, { ButtonHTMLAttributes, DetailedHTMLProps } from 'react';
import classes from './index.module.scss';
import cn from 'classnames';
import { Spin } from 'antd';

const Button = (props: Props) => {
  const { styleType, loading, children, disabled, ...restProps } = props;

  const buttonCn = cn(
    classes.button,
    {
      [classes.button__primary!]: styleType === ButtonType.Primary,
      [classes.button__secondary!]: styleType === ButtonType.Secondary,
    },
    restProps.className,
    'rounded',
  );

  return (
    <button
      {...restProps}
      type={restProps.type ?? 'button'}
      className={buttonCn}
      disabled={loading || disabled}>
      {/*Actually this Spin hidden not at all with using this className , so I had add this condition*/}
      {loading && (
        <Spin
          className={cn('buttonSpinner', classes.button__spinner, {
            buttonSpinner_hidden: !loading,
          })}
        />
      )}

      <span>{children}</span>
    </button>
  );
};

export default Button;

interface Props
  extends DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> {
  styleType?: ButtonType;
  loading?: boolean;
  disabled?: boolean;
}

export enum ButtonType {
  Primary = 'primary',
  Secondary = 'secondary',
  Default = 'default',
}
