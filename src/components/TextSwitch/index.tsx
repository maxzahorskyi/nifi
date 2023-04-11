import React, { useRef, useState } from 'react';
import classes from './index.module.scss';
import cn from 'classnames';
import useWindowDimensions from '../../hooks/useWindowDimensions';
import useDocumentScrollThrottled from '../../hooks/useDocumentScrollThrottled';

const TextSwitch = <T,>(props: Props<T>) => {
  const {
    filters,
    getTitle,
    isActive,
    getKey,
    onItemClick,
    deepBg,
    currentUsersFilterKey,
    seriesNumber,
  } = props;
  const [filterClicked, setFilterClicked] = useState(false);
  const node = useRef<any>(null);
  const { width, maxMobileWidth } = useWindowDimensions();
  const [shouldHideHeader, setShouldHideHeader] = useState(false);

  const closeMenu = () => {
    document.removeEventListener('click', closeMenu);
    setFilterClicked(() => {
      return false;
    });
  };
  const handleFilterClick = () => {
    if (filterClicked) {
      document.addEventListener('click', handleOutsideClick, false);
    } else {
      document.removeEventListener('click', handleOutsideClick, false);
    }
    setFilterClicked(!filterClicked);
  };

  const handleOutsideClick = (e: { target: any }) => {
    if (!!node.current && !node.current?.contains(e.target)) {
      handleFilterClick();
    }
  };

  const handleFilterItemClick = (filter: T) => {
    onItemClick(filter);
    handleFilterClick();
  };

  const activeFilter: any = filters.find((filter) => isActive(filter));

  const MINIMUM_SCROLL = 80;
  const TIMEOUT_DELAY = 300;

  useDocumentScrollThrottled((callbackData: { previousScrollTop: any; currentScrollTop: any }) => {
    const { previousScrollTop, currentScrollTop } = callbackData;
    const isScrolledDown = previousScrollTop < currentScrollTop;
    const isMinimumScrolled = currentScrollTop > MINIMUM_SCROLL;

    setTimeout(() => {
      setShouldHideHeader(isScrolledDown && isMinimumScrolled);
    }, TIMEOUT_DELAY);
  });

  return width > maxMobileWidth ? (
    <div className={classes.filter} style={{ color: deepBg ? '#fff' : '#000' }}>
      {filters.map((filter) => {
        return (
          <span
            key={getKey(filter)}
            onClick={() => onItemClick(filter)}
            className={cn(
              classes.filter__item,
              deepBg
                ? {
                    [classes.filter__item_activeDeep!]: isActive(filter),
                  }
                : {
                    [classes.filter__item_active!]: isActive(filter),
                  },
            )}>
            {getTitle(filter)}
            {getTitle(filter) === 'Series' && seriesNumber !== 0 && (
              <div className={classes.seriesNumber}>{seriesNumber}</div>
            )}
          </span>
        );
      })}
    </div>
  ) : (
    <div
      className={`${classes.mobileFilter__titleWrapper} ${
        shouldHideHeader
          ? classes.mobileFilter__titleWrapper__titleToTop
          : classes.mobileFilter__titleWrapper__titleUnderHeader
      }`}
      ref={node}>
      <div
        className={`
          ${classes.mobileFilter__title} + ${
          filterClicked ? classes.mobileFilterClicked : classes.mobileFilterArrow
        }
        `}
        onClick={handleFilterClick}>
        <div>{activeFilter?.title}</div>
      </div>
      <div
        className={filterClicked ? classes.mobileFilter__display : classes.mobileFilter__hide}
        style={{ background: deepBg ? '#0e1e3a' : 'white' }}>
        {filters.map((filter) => {
          return (
            <span
              key={getKey(filter)}
              onClick={() => handleFilterItemClick(filter)}
              className={cn(classes.filter__item, {
                [classes.filter__item_active!]: isActive(filter),
              })}
              style={{ color: deepBg ? 'white' : 'black' }}>
              {getTitle(filter)}
              {getTitle(filter) === 'Series' && seriesNumber !== 0 && (
                <div className={classes.seriesNumber}>{seriesNumber}</div>
              )}
            </span>
          );
        })}
      </div>
    </div>
  );
};

export default TextSwitch;

interface Props<T> {
  filters: T[];
  getTitle: (item: T) => string;
  getKey: (item: T) => string;
  isActive: (item: T) => boolean;
  onItemClick: (item: T) => void;
  currentUsersFilterKey?: any;
  deepBg?: boolean;
  seriesNumber?: number;
}
