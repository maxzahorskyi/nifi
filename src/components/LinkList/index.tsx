import React, { DetailedHTMLProps, HTMLAttributes } from 'react';
import classes from './index.module.scss';
import ArrowIcon from '../../../public/icons/arrowRight.svg';
import cn from 'classnames';
import View from '../../types/View';

const LinkList = <T,>(props: Props<T>) => {
  const { items, getItemTitle, getIsActive, handleItemClick, className, linkProps, ...rest } =
    props;

  return (
    <div className={cn(classes.linkList, className)}>
      <div className={classes.linkList__items}>
        {items.map((item, index) => {
          const wrapCn = cn(classes.linkList__wrap, {
            [classes.linkList__wrap_active!]: getIsActive(item),
          });

          return (
            <div
              {...rest}
              className={cn(wrapCn, linkProps?.className)}
              onClick={() => handleItemClick?.(item)}
              key={index}>
              <ArrowIcon className={classes.icon} />
              <span className={classes.linkList__title}>{getItemTitle(item)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LinkList;

interface Props<T> {
  items: T[];
  getItemTitle: (item: T) => View;
  getIsActive: (item: T) => boolean;
  handleItemClick?: (item: T) => void;
  className?: string;
  linkProps?: DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>;
}
