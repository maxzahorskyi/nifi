import React, { DetailedHTMLProps, HTMLAttributes, useState } from 'react';
import Title from '../Title';
import View from '../../types/View';
import classes from './index.module.scss';
import cn from 'classnames';
import useDocumentScrollThrottled from '../../hooks/useDocumentScrollThrottled';
import useWindowDimensions from '../../hooks/useWindowDimensions';
import ThemeSwitcher from '../ThemeSwitcher';

const Category = ({
  onTitleClick,
  title,
  children,
  contentProps,
  deepBg,
  bgTitleColor,
  filters,
  isSwitch,
  setTheme,
  filterMaxMobileWidth,
  isBottomLine,
  ...restProps
}: Props) => {
  const [shouldHideHeader, setShouldHideHeader] = useState(false);
  const { width, maxMobileWidth } = useWindowDimensions();

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

  return (
    <div
      {...restProps}
      className={cn(restProps.className, deepBg ? classes.categoryDeep : classes.category)}>
      {title !== null && title && (
        <div
          className={`
          ${classes.titleWrapper} + ${
            shouldHideHeader ? classes.titleToTop : classes.titleUnderHeader
          }`}
          style={{
            maxWidth: bgTitleColor ? '100vw' : deepBg || filterMaxMobileWidth ? 1306 : '100%',
            background: bgTitleColor
              ? bgTitleColor
              : deepBg && width <= maxMobileWidth
              ? '#0e1e3a'
              : width <= maxMobileWidth
              ? 'white'
              : 0,
            borderBottom: isBottomLine ? '2px solid #e4456c' : '0',
          }}>
          <Title
            onClick={onTitleClick}
            className={deepBg ? classes.titleWrapper_titleDeep : classes.titleWrapper_title}>
            {title}
          </Title>
          {isSwitch && <ThemeSwitcher setTheme={setTheme} classNameWrap={classes.themeSwitcher} />}

          {filters}
        </div>
      )}
      <div
        {...contentProps}
        className={cn(
          deepBg ? classes.categoryDeep__content : classes.category__content,
          contentProps?.className,
        )}>
        {children}
      </div>
    </div>
  );
};

export default Category;

interface Props
  extends Omit<DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>, 'title'> {
  title: View;
  bgTitleColor?: string;
  children: View;
  onTitleClick?: () => void;
  contentProps?: DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>;
  filters?: JSX.Element | false;
  deepBg?: boolean;
  isSwitch?: boolean;
  setTheme?: any;
  filterMaxMobileWidth?: boolean;
  isBottomLine?: boolean;
}
