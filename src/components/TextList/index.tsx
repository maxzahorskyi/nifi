import React, { DetailedHTMLProps, HTMLAttributes, ReactNode } from 'react';
import classes from './index.module.scss';
import cn from 'classnames';
import useWindowDimensions from '../../hooks/useWindowDimensions';

const TextList = <T,>(props: Props<T>) => {
  const {
    title,
    items,
    getItemTitle,
    itemClassName,
    isDividerShow,
    ownToken,
    tokenPageCreate,
    noLineUnderCard,
    titleClassname,
    ...restProps
  } = props;
  return (
    <div {...restProps} className={cn(classes.textList, restProps.className)}>
      {title && <span className={cn(classes.textList__title, titleClassname)}>{title}</span>}

      <div className={classes.textList__items}>
        {items?.map((item, index) => {
          if (item) {
            return (
              <span key={index} className={cn(classes.textList__item, itemClassName)}>
                {getItemTitle(item)}
              </span>
            );
          }
          return;
        })}
      </div>
    </div>
  );
};

export default TextList;

interface Props<T> extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
  title?: string;
  items: T[];
  getItemTitle: (item: T) => string | ReactNode;
  itemClassName?: string;
  isDividerShow?: boolean;
  titleClassname?: any;
  ownToken?: boolean;
  tokenPageCreate?: boolean;
  noLineUnderCard?: boolean;
}
