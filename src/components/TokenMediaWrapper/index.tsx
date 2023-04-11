import React, { useMemo } from 'react';
import getMediaUrl from '../../utils/getMediaUrl';
import { TokenType } from '../../features/Token/TokenService';
import useWindowDimensions from '../../hooks/useWindowDimensions';
import classes from '../../features/Home/Components/Slider/index.module.scss';
import { Carousel } from 'antd';
import MediaPreview from '../MediaPreview';

const TokenMediaWrapper = ({
  media,
  title,
  type,
  tokenID,
  maximum,
  isIpfs,
  stamp,
  frame,
  stampImg,
  preview,
}: any) => {
  const { isDesktopWidth } = useWindowDimensions();

  const adaptiveLayout = useMemo(() => {
    return media.map((params: any, index: number) => {
      if (params?.hash && params?.width && params?.height && params?.mimetype) {
        const { hash, height, subtitle, weight, mimetype, width, role } = params;
        if (role === 'preview' && stamp) {
          return (
            <MediaPreview
              key={index.toString()}
              hash={hash}
              isIpfs
              subtitle={subtitle}
              number={index + 1}
              meta={{
                width,
                height,
                mimetype: mimetype || '',
                weight: +(stampImg?.weight || ''),
              }}
              title={title ?? ''}
              hint={`${type === TokenType.Art2 ? tokenID : 1} of ${maximum ?? 1}`}
              subtitleText={subtitle || ''}
              imageArrayLength={media.length}
              stampSubtitle={stampImg?.subtitle}
              frameSubtitle={frame?.subtitle}
              stamp={stamp}
              type={type}
              stampSrc={preview?.hash}
              noLineUnderCard
            />
          );
        }
        if (!stamp) {
          return (
            <MediaPreview
              key={index}
              hash={hash}
              subtitle={subtitle}
              number={index + 1}
              meta={{
                width,
                height,
                mimetype: mimetype || '',
                weight: +(weight || ''),
              }}
              title={title ?? ''}
              type={type}
              hint={`${type === TokenType.Art2 ? tokenID : 1} of ${maximum ?? 1}`}
              subtitleText={subtitle || ''}
              imageArrayLength={media.length}
              noLineUnderCard
            />
          );
        }
      }
      return;
    });
  }, [type]);

  return isDesktopWidth ? (
    adaptiveLayout
  ) : (
    <Carousel dots={{ className: classes.mobileTokenCarouselDots }}>{adaptiveLayout}</Carousel>
  );
};

export default TokenMediaWrapper;
