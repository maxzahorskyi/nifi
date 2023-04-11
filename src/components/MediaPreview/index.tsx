import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import classes from './index.module.scss';
import CrossIcon from '../../../public/icons/cross.svg';
import FullScreenIcon from '../../../public/icons/fullScreen.svg';
import View from '../../types/View';
import ImageMeta from '../ImageMeta';
import FullMediaViewModal from '../FullMediaViewModal';
import PlatformUtil from '../../utils/PlatformUtil';
import useWindowDimensions from '../../hooks/useWindowDimensions';
import { rarityNumber, TokenType } from '../../features/Token/TokenService';
import cn from 'classnames';
import { Select } from 'antd';
import getConfig from 'next/config';
import { useRouter } from 'next/router';
import getMediaUrl, { MediaUrlType } from '../../utils/getMediaUrl';
import { ImageParams } from '../../config/http/MediaService';

const MediaPreview = ({
  subtitle,
  stampSubtitle,
  frameSubtitle,
  stampInputSubtitle,
  frameInputSubtitle,
  rarity,
  number,
  onDelete,
  meta,
  onReload,
  title,
  hint,
  subtitleText,
  ownToken,
  imageArrayLength,
  tokenPageCreate,
  noLineUnderCard,
  openCardModal,
  closePreview,
  closeVideoModal,
  onRarityChange,
  isRarityShown,
  stamp,
  type,
  isForever,
  stampSrc,
  hash,
  src,
}: Props) => {
  const router = useRouter();
  const { width, height, mimetype, weight, path } = meta || {};
  const config = getConfig();
  const imgUrl = config.publicRuntimeConfig.services.mediaUrl;
  const { t } = useTranslation();
  const { width: innerWindowWidth, maxMobileWidth } = useWindowDimensions();
  const [isFullImageViewModalOpen, setIsFullImageViewModalOpen] = useState<boolean>(false);
  const [isFullImageLoading, setIsFullImageLoading] = useState<boolean>(true);
  const [noRenderPreviewPage] = useState<string[]>([
    '/gallery',
    '/user/[usernameOrAccountNumber]',
    '/collection/[collectionId]',
  ]);

  useEffect(() => {
    setIsFullImageViewModalOpen(Boolean(openCardModal));
  }, [openCardModal]);

  const openFullImageViewModal = () => {
    setIsFullImageViewModalOpen(true);
  };

  const closeFullImageViewModal = (e: any) => {
    e.stopPropagation();
    setIsFullImageViewModalOpen(false);
    closePreview && closePreview(false);
    closeVideoModal && closeVideoModal(false);
  };

  const getImageSrc = (params: ImageParams): string => {
    if (hash && meta) {
      // TODO: add support ipfs format in the future
      return getMediaUrl(hash, meta?.mimetype?.split('/')[0] as MediaUrlType, params);
    }
    return src || '';
  };

  //not working - Can't perform a React state update on an unmounted component.
  // This is a no-op, but it indicates a memory leak in your application.
  // To fix, cancel all subscriptions and asynchronous tasks in a useEffect cleanup function.
  // useEffect(() => {
  //   if (!noRenderPreviewPage.includes(router.pathname)) {
  //     const fullImage = new Image()
  //     fullImage.src = getImageSrc({})
  //     fullImage.onload = () => setIsFullImageLoading(false)
  //   }
  // }, [])

  return (
    <div className={classes.wrap}>
      <div style={{ position: 'relative' }}>
        {innerWindowWidth < maxMobileWidth && mimetype?.includes('image') && (
          <div className={classes.fullScreenIcon}>
            <FullScreenIcon onClick={openFullImageViewModal} />
          </div>
        )}

        {!noRenderPreviewPage.includes(router.pathname) && (
          <div className={classes.imagesWrapper}>
            {mimetype?.includes('image') ? (
              <img
                key="images"
                className={`${classes.image}`}
                src={
                  isFullImageLoading
                    ? getImageSrc({ width: 300, compressionQuality: 100 })
                    : getImageSrc({})
                }
                alt="Token"
                loading="lazy"
              />
            ) : (
              <div />
            )}

            {mimetype?.includes('video') && ( // eslint-disable-next-line jsx-a11y/media-has-caption
              <video className={`${classes.video}`} autoPlay muted controls>
                <source src={getImageSrc({})} type={mimetype} />
              </video>
            )}
          </div>
        )}

        <div style={{ flexWrap: stamp ? 'wrap' : 'nowrap' }} className={classes.description}>
          <div className={classes.actions}>
            {innerWindowWidth < maxMobileWidth ? (
              <div className={classes.title}>{title !== null && title}</div>
            ) : (
              innerWindowWidth >= maxMobileWidth && (
                <>
                  <FullScreenIcon onClick={openFullImageViewModal} />
                  {onDelete && <CrossIcon onClick={onDelete} />}
                </>
              )
            )}
          </div>
          {innerWindowWidth <= maxMobileWidth && <div className={classes.redDivider} />}
          {innerWindowWidth <= maxMobileWidth && !stamp && (
            <div className={classes.valueAndLabelWrapper}>
              <div>
                <span className={classes.label}>
                  #{number} {innerWindowWidth > maxMobileWidth && t('MediaPreview.Subtitle')}
                </span>
                <span className={classes.labelOf}>
                  {' '}
                  {!tokenPageCreate ? `of ${imageArrayLength}` || 1 : ''}
                </span>
              </div>

              <span className={classes.value}>{subtitle}</span>
            </div>
          )}

          {stamp && innerWindowWidth < maxMobileWidth && stampSubtitle && (
            <div className={classes.stampSubtitleContainerMobile}>
              <span className={classes.label}>{t('MediaPreview.StampSubtitle')}</span>
              <span className={classes.stampValue}>{stampSubtitle}</span>

              <span className={classes.label}>{t('MediaPreview.FrameSubtitle')}</span>
              <span className={classes.stampValue}>{frameSubtitle}</span>
            </div>
          )}

          {innerWindowWidth > maxMobileWidth &&
            !isRarityShown &&
            !stampSubtitle &&
            !frameSubtitle &&
            !frameInputSubtitle &&
            !stampInputSubtitle &&
            type !== TokenType.Forever && (
              <>
                <span className={classes.label}>
                  #{number} {innerWindowWidth > maxMobileWidth && t('MediaPreview.Subtitle')}
                </span>
                <span className={classes.value}>{subtitle}</span>
              </>
            )}

          {innerWindowWidth > maxMobileWidth && stampInputSubtitle && (
            <div style={{ width: '450px', display: 'flex', justifyContent: 'space-between' }}>
              <span className={classes.label}>
                {innerWindowWidth > maxMobileWidth && t('MediaPreview.StampSubtitle')}
              </span>
              <span className={classes.stampValue}>{stampInputSubtitle}</span>
            </div>
          )}

          {innerWindowWidth > maxMobileWidth && frameInputSubtitle && (
            <div
              style={{
                width: '450px',
                display: 'flex',
                justifyContent: 'space-between',
              }}>
              <span className={classes.label}>
                {innerWindowWidth > maxMobileWidth && t('MediaPreview.FrameSubtitle')}
              </span>
              <span className={classes.stampValue}>{frameInputSubtitle}</span>
            </div>
          )}

          {stamp && innerWindowWidth > maxMobileWidth && stampSubtitle && (
            <div style={{ width: '450px', display: 'flex', justifyContent: 'space-between' }}>
              <span className={classes.label}>
                {innerWindowWidth > maxMobileWidth && t('MediaPreview.StampSubtitle')}
              </span>
              <span className={classes.stampValue}>{stampSubtitle}</span>
            </div>
          )}

          {stamp && innerWindowWidth > maxMobileWidth && frameSubtitle && (
            <div
              style={{
                flexBasis: '100%',
                marginLeft: 50,
                display: 'flex',
                justifyContent: 'space-between',
              }}>
              <span className={classes.label}>
                {innerWindowWidth > maxMobileWidth && t('MediaPreview.FrameSubtitle')}
              </span>
              <span className={classes.stampValue}>{frameSubtitle}</span>
            </div>
          )}

          {innerWindowWidth > maxMobileWidth && isRarityShown && onRarityChange && (
            <div className={classes.rarity}>
              <span className={classes.rarity_label}>
                #{number} {innerWindowWidth > maxMobileWidth && t('MediaPreview.Subtitle')}
              </span>
              <span className={classes.rarity_value}>{subtitle}</span>
              <span className={classes.rarity_label}>
                #{number} {innerWindowWidth > maxMobileWidth && t('MediaPreview.Rarity')}
              </span>
              <span className={classes.rarity_value}>
                <Select
                  bordered={false}
                  defaultValue={4}
                  value={rarity}
                  onChange={(value) => onRarityChange(value)}
                  className={cn(classes.select, classes.formControl)}>
                  {rarityNumber.map((item: number, index) => (
                    <Select.Option className={classes.rarityNumber} value={item} key={index}>
                      {item}
                    </Select.Option>
                  ))}
                </Select>
              </span>
            </div>
          )}
        </div>
      </div>
      {meta && type !== TokenType.Forever && (
        <div className={classes.imageMetaWrapper}>
          <ImageMeta
            mimetype={mimetype}
            weight={weight}
            width={width}
            height={height}
            path={path}
            onReload={onReload}
            ownToken={ownToken}
            tokenPageCreate={tokenPageCreate}
            noLineUnderCard={noLineUnderCard}
          />
        </div>
      )}

      {PlatformUtil.isOnClientSide() && (
        <FullMediaViewModal
          width={width ?? 0}
          height={height ?? 0}
          src={getImageSrc({})}
          thumb={getImageSrc({ width: 300, compressionQuality: 70 })}
          isOpen={isFullImageViewModalOpen}
          onClose={closeFullImageViewModal}
          title={title}
          subtitle={subtitleText}
          weight={weight}
          mimetype={mimetype}
          hint={hint}
          stampSrc={`${imgUrl}/${stampSrc}`}
          stamp={stamp}
          isForever={isForever}
        />
      )}
    </div>
  );
};

interface Props {
  subtitle?: View;
  stampSubtitle?: View;
  frameSubtitle?: View;
  stampInputSubtitle?: View;
  frameInputSubtitle?: View;
  rarity?: number;
  number: number;
  onDelete?: () => void;
  onReload?: (image: File | undefined) => void;
  meta?: Meta;
  title: string;
  hint: string;
  subtitleText: string;
  ownToken?: boolean;
  imageArrayLength?: number;
  tokenPageCreate?: boolean;
  noLineUnderCard?: boolean;
  openCardModal?: boolean;
  closePreview?: any;
  closeVideoModal?: any;
  onRarityChange?: (rarity: number) => void;
  isRarityShown?: boolean;
  isForever?: boolean;
  type?: any;
  stamp?: boolean;
  stampSrc?: string;
  hash?: string;
  src?: string;
  isIpfs?: boolean;
}

interface Meta {
  width: any;
  height: any;
  mimetype: string;
  weight: number; // Bytes
  path?: string;
}

export default MediaPreview;
