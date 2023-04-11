import React, { useEffect, useState } from 'react';
import classes from './index.module.scss';
import View from '../../../../types/View';
import useWindowDimensions from '../../../../hooks/useWindowDimensions';

const itemWidth = 422;

const Carousel = ({ children, containerId, gapBetweenItems, deepBg }: Props) => {
  const [container, setContainer] = useState<HTMLElement | null>(null);
  const [inactiveSliderArrow, setInactiveSliderArrow] = useState<string>('left');
  const [scrollPositions, setScrollPositions] = useState({ left: 0, right: 2 });
  const { width: innerWindowWidth, maxMobileWidth } = useWindowDimensions();

  const scrollCarousel = (right: boolean) => {
    if (container) {
      // setInactiveSliderArrow('')
      if (right) {
        container.scrollLeft -= itemWidth;
        setScrollPositions({ left: container.scrollLeft - itemWidth / 1.5, right: 2 });
      } else if (!right) {
        container.scrollLeft += itemWidth;
        setScrollPositions({
          left: container.scrollLeft + itemWidth,
          right: container.scrollLeft + itemWidth,
        });
      }
    }
  };

  // useEffect(() => {
  //   if (scrollPositions.left < 0) {
  //     setInactiveSliderArrow('left')
  //   }
  //   if (scrollPositions.right > itemWidth * 2) {
  //     setInactiveSliderArrow('right')
  //   }
  // }, [scrollPositions])

  useEffect(() => {
    const item = document.getElementById(containerId);
    setContainer(item);
  }, []);

  return (
    <div className={classes.wrapper}>
      {innerWindowWidth > maxMobileWidth && (
        <div className={classes.arrowWrapper}>
          <div
            className={classes.arrowLeft}
            onClick={() => {
              scrollCarousel(true);
              setInactiveSliderArrow('left');
            }}>
            {inactiveSliderArrow === 'left' ? (
              <img src="/images/HomePage/SliderLeftArrowInactive.svg" alt="" />
            ) : (
              <img
                src={
                  deepBg
                    ? '/images/HomePage/leftWhiteArrow.svg'
                    : '/images/HomePage/SliderLeftArrowActive.svg'
                }
                alt=""
              />
            )}
          </div>
          <div
            className={classes.arrowRight}
            onClick={() => {
              scrollCarousel(false);
              setInactiveSliderArrow('right');
            }}>
            {inactiveSliderArrow === 'right' ? (
              <img src="/images/HomePage/SliderRightArrowInactive.svg" alt="" />
            ) : (
              <img
                src={
                  deepBg
                    ? '/images/HomePage/rightWhiteArrow.svg'
                    : '/images/HomePage/SliderRightArrow.svg'
                }
                alt=""
              />
            )}
          </div>
        </div>
      )}

      <div
        id={containerId}
        className={classes.container}
        style={{ gridColumnGap: gapBetweenItems || 32 }}>
        {children}
      </div>
    </div>
  );
};

interface Props {
  children?: View;
  containerId: string;
  gapBetweenItems?: number;
  deepBg?: boolean;
}

export default Carousel;
