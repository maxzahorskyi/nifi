import React from 'react';
import classes from './index.module.scss';
import SliderDescription from '../SliderDescription';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import getCorrectImageUrl from '../../../../utils/GetCorrectImageUrlUtil';
import { GQLUi_management as GQLUiManagement } from '../../../../types/graphql.schema';
import useWindowDimensions from '../../../../hooks/useWindowDimensions'; // requires a loader

const Slider = ({ mainSliders }: Props) => {
  if (!mainSliders.length) return <></>;

  const visibleSlides = mainSliders.filter((slide) => slide.visibilityStatus);
  const { width: innerWindowWidth, maxMobileWidth } = useWindowDimensions();
  return (
    <Carousel
      infiniteLoop
      showIndicators
      showStatus={false}
      autoPlay
      stopOnHover
      emulateTouch
      showArrows={false}
      showThumbs={false}
      className={classes.imageWrap}
      interval={5000}
      transitionTime={1000}>
      {visibleSlides.map((slide: GQLUiManagement, i) => (
        <div key={i} className={classes.sliderContainer}>
          <img
            height={innerWindowWidth < maxMobileWidth ? '100%' : 'auto'}
            alt={slide.assetTitle}
            className={classes.slideImage}
            src={getCorrectImageUrl(slide?.assetID?.image)}
          />
          <SliderDescription
            description={slide.assetID?.assetTitle}
            href={slide.assetID?.textLanding || ''}
          />
        </div>
      ))}
    </Carousel>
  );
};

interface Props {
  mainSliders: GQLUiManagement[];
}

export default Slider;
