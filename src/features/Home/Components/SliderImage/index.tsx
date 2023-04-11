import React, { SVGProps } from 'react';
import PropTypes from 'prop-types';

const SliderImage = (props: { width: any; src: any }) => {
  const { width, src } = props;

  return <img style={{ width }} src={src} />;
};

export default SliderImage;
