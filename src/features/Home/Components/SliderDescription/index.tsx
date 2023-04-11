import React from 'react';
import classes from './index.module.scss';
import Link from 'next/link';

const SliderDescription = ({ description, href }: Props) => {
  return (
    <Link href={href}>
      <a>
        <div className={classes.container}>
          <div className={classes.sliderText}>
            {description || 'no description for this slide'}
            <div className={classes.redLine} />
          </div>
        </div>
      </a>
    </Link>
  );
};

interface Props {
  description: string | undefined;
  href: string;
}

export default SliderDescription;
