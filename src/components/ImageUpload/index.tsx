import React, { DetailedHTMLProps, Fragment, HTMLAttributes } from 'react';
import Title from '../Title';
import classes from './index.module.scss';
import { Skeleton } from 'antd';
import cn from 'classnames';
import FileButton from '../FileButton';
import LinkList from '../LinkList';
import useWindowDimensions from '../../hooks/useWindowDimensions';
import BigDividerMobile from '../BigDividerMobile';
import ImageMeta from '../ImageMeta';
import getMediaResolution, { MediaResolution } from '../../utils/getMediaResolution';
import getConfig from 'next/config';

const ImageUpload = ({
  items,
  className,
  onUpload,
  onReload,
  editedPhotoBlob,
  editedWallpaperBlob,
  ...props
}: Props) => {
  const { width: innerWindowWidth, maxMobileWidth } = useWindowDimensions();
  const config = getConfig();
  const imgUrl = config.publicRuntimeConfig.services.mediaUrl;

  const avatar = items?.find(({ key }) => key === 'avatar')?.avatar;
  const wallpaper = items?.find(({ key }) => key === 'wallpaper')?.wallpaper;

  return (
    <div {...props} className={cn(className, classes.imageUpload)}>
      {items.map(({ key, title, image, hash, blobHash }, i) => (
        <Fragment key={key}>
          {innerWindowWidth <= maxMobileWidth ? (
            <div className={classes.mediaWrapper}>
              <Title>{title}</Title>
              <div>
                <FileButton
                  fileInputProps={{
                    accept: 'image/*',
                    onChange(e) {
                      onUpload(key, e.target.files?.[0], e?.target?.files?.length);
                    },
                  }}>
                  <LinkList items={['Browse']} getItemTitle={(i) => i} getIsActive={(_) => true} />
                </FileButton>
              </div>
            </div>
          ) : (
            <Title>{title}</Title>
          )}
          <div>
            {blobHash ? (
              <img
                alt={title}
                style={{
                  objectFit: key === 'wallpaper' ? 'contain' : 'cover',
                  aspectRatio: `${key === 'wallpaper' ? 4.45333 : 1}`,
                }}
                width={innerWindowWidth <= maxMobileWidth ? 340 : 450}
                src={blobHash}
              />
            ) : image ? (
              <img
                alt={title}
                className={classes.image}
                width={innerWindowWidth <= maxMobileWidth ? 340 : 450}
                height={innerWindowWidth <= maxMobileWidth ? 340 : 450}
                src={image instanceof File ? URL.createObjectURL(image) : image}
              />
            ) : hash ? (
              <img
                alt={title}
                className={classes.image}
                width={innerWindowWidth <= maxMobileWidth ? 340 : 450}
                height={innerWindowWidth <= maxMobileWidth ? 340 : 450}
                src={`${imgUrl}/${hash}`}
              />
            ) : (
              <Skeleton.Image
                className={
                  innerWindowWidth > maxMobileWidth ? classes.skeleton : classes.skeletonMedia
                }
              />
            )}
          </div>

          {innerWindowWidth > maxMobileWidth && (
            <div>
              <FileButton
                fileInputProps={{
                  accept: 'image/*',
                  onChange(e) {
                    onUpload(key, e.target.files?.[0], e?.target?.files?.length);
                  },
                }}>
                <LinkList items={['Browse']} getItemTitle={(i) => i} getIsActive={(_) => true} />
              </FileButton>
              {innerWindowWidth > maxMobileWidth && key === 'avatar' && avatar?.width && (
                <ImageMeta
                  key={key}
                  mimetype={avatar?.file?.type}
                  weight={avatar?.file?.size}
                  width={avatar?.width}
                  height={avatar?.height}
                  path={avatar?.file?.name}
                  onReload={onReload}
                />
              )}
              {innerWindowWidth > maxMobileWidth && key === 'wallpaper' && wallpaper?.width && (
                <ImageMeta
                  key={key}
                  mimetype={wallpaper?.file?.type}
                  weight={wallpaper?.file?.size}
                  width={wallpaper?.width}
                  height={wallpaper?.height}
                  path={wallpaper?.file?.name}
                  onReload={onReload}
                />
              )}
            </div>
          )}
          {innerWindowWidth <= maxMobileWidth && items.length - 1 !== i && (
            <BigDividerMobile paddingBottom={40} paddingTop={40} />
          )}
        </Fragment>
      ))}
    </div>
  );
};

export default ImageUpload;

interface Props extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
  editedWallpaperBlob?: Blob | null;
  editedPhotoBlob?: Blob | null;
  items: Item[];
  onUpload: (key: string, file: File | undefined, isFilesLength?: any) => void;
  onReload?: (image: File | undefined) => void;
}

interface Item {
  key: string;
  image?: File | string | undefined;
  title: string;
  avatar?: any;
  hash?: string;
  blobHash?: string | undefined;
  wallpaper?: any;
}
