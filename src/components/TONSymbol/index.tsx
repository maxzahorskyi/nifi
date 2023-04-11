import React from 'react';
import Image, { ImageProps } from 'next/image';

// value of enum based on svg icon name
// TON*.svg - TON.svg (Regular), TONLight.svg (Light)
export enum TONSymbolWeight {
  Light = 'Light',
  Regular = '',
}

interface Props extends Omit<ImageProps, 'src'> {
  weight: TONSymbolWeight;
}

const TONSymbol = ({
  weight = TONSymbolWeight.Regular,
  width = 10,
  height = 12,
  ...props
}: Props) => <Image src={`/icons/TON${weight}.svg`} width={width} height={height} {...props} />;

export default TONSymbol;
