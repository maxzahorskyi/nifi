import React from 'react';
import { message } from 'antd';
import classes from './index.module.scss';

const CopyWalletIcon = ({ text }: Props) => {
  return (
    // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
    <img
      className={classes.icon}
      src="/icons/copyIcon.svg"
      height="17px"
      width="17px"
      alt="copy"
      onClick={() => {
        navigator.clipboard.writeText(`${text}`);
        message.success('Copied');
      }}
    />
  );
};

export default CopyWalletIcon;

interface Props {
  text: string | number;
}
