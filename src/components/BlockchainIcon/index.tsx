import React from 'react';

type Props = {
  readonly blockchain?: 'binance' | 'everscale';
  readonly className?: string;
  readonly style?: React.CSSProperties;
  readonly imgStyle?: React.CSSProperties;
  readonly imgClassName?: string;
  readonly textStyle?: React.CSSProperties;
  readonly textClassName?: string;
  readonly showText?: boolean;
};

const BlockchainIcon = ({
  blockchain = 'everscale',
  className,
  style,
  imgClassName,
  imgStyle,
  textStyle,
  textClassName,
  showText,
}: Props) => {
  if (blockchain === 'binance') {
    return (
      <div style={style} className={className}>
        <img
          src="/icons/binanceSign.svg"
          alt="everscale sign"
          width="32px"
          height="32px"
          className={imgClassName}
          style={imgStyle}
        />
        {showText && (
          <span style={textStyle} className={textClassName}>
            {blockchain}
          </span>
        )}
      </div>
    );
  }
  return (
    <div style={style} className={className}>
      <img
        src="/icons/everscaleSign.svg"
        alt="everscale sign"
        width="32px"
        height="32px"
        className={imgClassName}
        style={imgStyle}
      />
      {showText && (
        <span style={textStyle} className={textClassName}>
          {blockchain}
        </span>
      )}
    </div>
  );
};

export default BlockchainIcon;
