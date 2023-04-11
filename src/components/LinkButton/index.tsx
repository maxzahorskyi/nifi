import React from 'react';
import Link from 'next/link';
import classes from './index.module.scss';
import View from '../../types/View';
import cn from 'classnames';

const LinkButton = (props: Props) => {
  const { title, href, isActive } = props;

  return (
    <button className={cn(classes.button, { [classes.button_active!]: isActive })}>
      <Link href={href}>
        <a>{title}</a>
      </Link>
    </button>
  );
};

export default LinkButton;

interface Props {
  title: View;
  href: string;
  isActive?: boolean;
}
