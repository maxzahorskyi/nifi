import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';

import classes from './index.module.scss';
import { SwiperOptions } from 'swiper/types/swiper-options';

const Slider = <T,>(props: Props<T>) => {
  const { slides, ...restProps } = props;
  return (
    <div className={classes.container}>
      <Swiper {...restProps}>
        {slides.map((slide) => {
          return <SwiperSlide>{slide}</SwiperSlide>;
        })}
      </Swiper>
    </div>
  );
};

export default Slider;

interface Props<T> extends SwiperOptions {
  slides: T[];
}
