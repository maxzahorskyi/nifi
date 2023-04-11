import React from 'react';
import Button from '../Button';
import classes from '../Header/index.module.scss';
import Link from 'next/link';

const QuickStartButton = () => {
  return (
    <>
      <Link href="/help">
        <Button className={classes.quickStartButton}>Quick start manual</Button>
      </Link>
    </>
  );
};

export default QuickStartButton;
