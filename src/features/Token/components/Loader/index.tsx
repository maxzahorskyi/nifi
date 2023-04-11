import React from 'react';
import classes from '../../styles/loader.module.scss';
import { Alert } from 'antd';

interface Props {
  text: string;
}
const Loader = ({ text }: Props) => {
  return (
    <Alert
      className={classes.loader}
      message="Please wait. Don't reload this page"
      description={`We are awaiting for confirmation of ${text} on blockchain`}
      type="warning"
      showIcon
    />
  );
};

export default Loader;
