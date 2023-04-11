import React, { useState } from 'react';
import { Modal, Skeleton } from 'antd';
import classes from './index.module.scss';
import MediaUtil from '../../utils/MediaUtil';
import DescriptionUtil from '../../utils/DescriptionUtil';
import useWindowDimensions from '../../hooks/useWindowDimensions';

const FullMediaViewModal = ({
  width,
  height,
  src,
  thumb,
  alt = '',
  isOpen,
  onClose,
  title,
  subtitle,
  weight,
  mimetype,
  hint,
  stamp,
  isForever,
  stampSrc,
}: Props) => {
  const { width: windowWidth, height: screenHeight } = useWindowDimensions();
  const screenRation = (screenHeight - 90) / (windowWidth - 20);
  const tokenAspectRation = height / width;
  const [isLoaded, setIsLoaded] = useState(false);
  const imageSize = (key: string): number | string => {
    if (screenRation < tokenAspectRation && key === 'height') {
      return screenHeight;
    }

    if (screenRation > tokenAspectRation && key === 'width') {
      return windowWidth;
    }

    if (screenRation < tokenAspectRation && key === 'width') {
      return 'max-content';
    }

    if (screenRation > tokenAspectRation && key === 'height') {
      return screenHeight - 120;
    }

    if (screenRation < tokenAspectRation && key === 'heightImg') {
      return screenHeight - 92;
    }
    if (screenRation > tokenAspectRation && key === 'heightImg') {
      return '100%';
    }

    if (screenRation < tokenAspectRation && key === 'heightVideo') {
      return screenHeight - 100;
    }
    if (screenRation > tokenAspectRation && key === 'heightVideo') {
      return 'auto';
    }

    return 0;
  };

  const crop = (hint: string) => {
    if (hint?.includes(':')) {
      let a = hint.substring(0, 6);
      let x = hint.substring(62, 66);
      return `${a}...${x}`;
    }
    return hint;
  };
  return (
    <Modal
      className={classes.fullImageViewModal}
      width={imageSize('width')}
      style={{
        maxHeight: screenHeight,
      }}
      centered
      visible={isOpen}
      onCancel={onClose}
      footer={null}>
      <div style={{ overflow: 'hidden', position: 'relative' }}>
        {mimetype?.includes('image') && (
          <div
            style={{
              filter: isLoaded || mimetype === 'image/gif' ? 'blur(0)' : 'blur(5px)',
              transition: 'all .3s linear 0s',
            }}>
            <img
              className={classes.fullImageViewModal_imgFull}
              src={stamp ? stampSrc : src}
              alt={alt}
              style={{
                maxHeight: screenHeight - 90,
                maxWidth: windowWidth - 20,
                height: imageSize('heightImg'),
                opacity: isLoaded || mimetype === 'image/gif' ? 1 : 0,
                transition: 'opacity .3s ease 0ms',
              }}
              onLoad={() => {
                setIsLoaded(true);
              }}
              decoding="async"
              loading="lazy"
            />
            {mimetype !== 'image/gif' && (
              <img
                src={stamp ? stampSrc && `${stampSrc}/?width=300&compressionQuality=70` : thumb}
                className={classes.thumb}
                style={{
                  visibility: isLoaded || mimetype === 'image/gif' ? 'hidden' : 'visible',
                }}
              />
            )}
          </div>
        )}
        {isForever && stampSrc?.includes('undefined') && (
          <Skeleton.Image
            className={classes.antSkeletonElement}
            style={{ width: screenHeight - 90, height: screenHeight - 90 }}
          />
        )}
      </div>
      {mimetype?.includes('video') && (
        <video
          style={{
            maxHeight: screenHeight - 90,
            maxWidth: windowWidth - 52,
            height: imageSize('heightVideo'),
          }}
          muted
          autoPlay
          playsInline
          controls>
          <source src={src} />
        </video>
      )}

      <div className={classes.description}>
        <div className={classes.description__row}>
          {title !== null && (
            <span
              className={classes.description__primaryText}
              title={title.length > 50 ? title : undefined}>
              {DescriptionUtil.shorten(title, 16)}
            </span>
          )}
          <span
            className={classes.description__secondaryText}
            title={hint?.length > 50 ? hint : undefined}>
            {crop(hint)}
          </span>
        </div>

        <div className={classes.description__row}>
          <span className={classes.description__primaryText}>
            {DescriptionUtil.shorten(subtitle, 16)}
          </span>
          <span className={classes.description__secondaryText}>
            {width} x {height} px, {MediaUtil.prepareMimetype(mimetype)} (
            {MediaUtil.prepareWeight(weight)} MB)
          </span>
        </div>
      </div>
    </Modal>
  );
};

export default FullMediaViewModal;

interface Props {
  width: any;
  height: number;
  src: string;
  thumb?: string;
  alt?: string;
  isOpen: boolean;
  onClose: any;
  title: string;
  subtitle: string;
  weight: number | undefined;
  mimetype: string | undefined;
  hint: string;
  isForever?: boolean;
  stamp?: boolean;
  stampSrc?: string;
}
