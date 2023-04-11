import Link from 'next/link';
import React, { DetailedHTMLProps, HTMLAttributes } from 'react';
import View from '../../types/View';
import cn from 'classnames';

const UserLink = ({ children, userId, className, ...props }: Props) => {
  return (
    <Link href={userId ? `/user/${userId}` : '/'}>
      {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
      <a>
        <div {...props} className={cn('link', className, { link_disabled: !userId })}>
          {children}
        </div>
      </a>
    </Link>
  );
};

export default UserLink;

interface Props extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
  children: View;
  userId: number | string | undefined;
}
