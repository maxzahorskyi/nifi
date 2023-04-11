import React, { useEffect, useState } from 'react';
import useDocumentScrollThrottled from '../../hooks/useDocumentScrollThrottled';
import classes from './index.module.scss';
import View from '../../types/View';

const StickyContainer = ({ children }: Props) => {
  const [shouldHideHeader, setShouldHideHeader] = useState(false);
  const [shouldShowShadow, setShouldShowShadow] = useState(false);

  const shadowStyle = shouldShowShadow ? classes.show : '';
  const hiddenStyle = shouldHideHeader ? classes.hide : '';

  const MINIMUM_SCROLL = 80;
  const TIMEOUT_DELAY = 300;

  useDocumentScrollThrottled((callbackData: { previousScrollTop: any; currentScrollTop: any }) => {
    const { previousScrollTop, currentScrollTop } = callbackData;
    const isScrolledDown = previousScrollTop < currentScrollTop;
    const isMinimumScrolled = currentScrollTop > MINIMUM_SCROLL;

    setShouldShowShadow(currentScrollTop > 2);

    setTimeout(() => {
      setShouldHideHeader(isScrolledDown && isMinimumScrolled);
    }, TIMEOUT_DELAY);
  });
  return <div className={`${classes.container} + ${shadowStyle} + ${hiddenStyle}`}>{children}</div>;
};

interface Props {
  children: View;
}

export default StickyContainer;
