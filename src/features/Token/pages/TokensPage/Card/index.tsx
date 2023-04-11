import React, { useEffect, useRef, useState } from 'react';
import classes from './index.module.scss';
import View from '../../../../../types/View';
import { Skeleton } from 'antd';
import useWindowDimensions from '../../../../../hooks/useWindowDimensions';
import MediaPreview from '../../../../../components/MediaPreview';
import getMediaUrl from '../../../../../utils/getMediaUrl';
import FullScreenIcon from '../../../../../../public/icons/fullScreen.svg';
import VideoIcon from '../../../../../../public/icons/videoIcon.svg';
import { TokenType } from '../../../TokenService';
import LikeBlock from '../../../../../components/LikeBlock';
import { TokenSaleType } from '../../../../../types/Tokens/Token';
import { ITokenInfoDto } from '../../../../../types/Tokens/TokenInfo';
import Link from 'next/link';
import EverIcon from '../../../../../components/EverIcon';
import { useSmallPrice } from '../../../../../hooks/useFormatPrice';
import TimeTag from '../../../../../components/TimeTag';
import TimeUtil from '../../../../../utils/TimeUtil';
import { useUser } from '../../../../../hooks/users';
import { FrontStatus, useFrontStatus } from '../../../../../hooks/status/useFrontStatus';

const getTruncatedString = (str: string, maxLength: number) =>
  str.length > maxLength ? `${str.slice(0, maxLength)}...` : str;

const Card = ({
  header,
  cardName,
  image,
  cardSubName,
  totalEdition,
  currentEdition,
  editionPrefix = 'Edition',
  hash,
  token,
  user,
  videoModal,
  setVideoModal,
  closeVideoModal,
  setToken,
  likeData,
  isDesign,
  saleType,
  timeTagProps,
  frontStatus,
}: Props) => {
  const { frontStatusArray } = useFrontStatus();
  const { url: imageUrl, isLoaded: isImageLoaded, setIsLoaded: setIsImageLoaded } = image;
  const { width: innerWindowWidth, maxMobileWidth, isDesktopWidth } = useWindowDimensions();
  const imageRef = useRef<HTMLImageElement>(null);
  const [isInfoRowWhite, setIsInfoRowWhite] = useState<boolean | undefined>(false);
  const [creatorAvatarHash, setCreatorAvatarHash] = useState<string | undefined>(undefined);
  const [creatorLink, setCreatorLink] = useState<string | number | undefined>(undefined);
  const [delayHandler, setDelayHandler] = useState<any>();
  const [isFullImageClick, setIsFullImageClick] = useState<boolean>(false);

  const stampImg = token?.raw?.media?.find(({ role }: { role: string }) => role === 'image');
  const preview = token?.raw?.media?.find(({ role }: { role: string }) => role === 'preview');

  const { width, height, mimetype, weight } =
    token?.raw?.media?.length > 0 ? token?.raw?.media?.[0] : token?.raw?.videos?.[0] || {};

  const getTimeColorBoolean = (): boolean | undefined => {
    let time = TimeUtil.getTimeLeft(timeTagProps?.endTime)?.split(' ')[0] || '';
    if (time.split('').pop() === 'h') {
      return parseInt(TimeUtil.getTimeLeft(timeTagProps?.endTime)?.split(' ')[0] || '', 10) > 2;
    }
    if (time.split('').pop() === 'm' || time.split('').pop() === 's') {
      return false;
    }
    return true;
  };

  useUser({
    skipQuery: user,
    variables: {
      query: {
        walletAddress: token?.deployed?.creator,
      },
    },
    onSuccess: (data) => {
      setCreatorAvatarHash(data?.user?.avatarHash);
      setCreatorLink(data?.user?.username ?? data?.user?.accountNumber);
    },
    onError: (e) => console.error(e),
  });

  useEffect(() => {
    if (!imageRef.current) return;
    setIsImageLoaded(imageRef.current.complete);
  }, []);

  useEffect(() => {
    if (!user) return;
    setCreatorAvatarHash(user?.avatarHash);
    setCreatorLink(user?.username ?? user?.accountNumber);
  }, [user]);

  const closePreview = (value: any) => {
    setVideoModal(value);
    setIsFullImageClick(value);
  };

  const handleMouseEnter = () => setDelayHandler(setTimeout(() => setVideoModal(true), 300));
  const handleMouseLeave = () => {
    setVideoModal(false);
    clearTimeout(delayHandler);
  };
  const handleMouseClick = (e: any) => {
    e.stopPropagation();
    e.preventDefault();
    setIsFullImageClick(true);
  };

  let isTimeTag =
    frontStatus &&
    !timeTagProps.isClosed &&
    saleType !== TokenSaleType.Pending &&
    !!(timeTagProps.endTime || timeTagProps.endOfferTime || timeTagProps.isExpired);

  return (
    <>
      <div
        className={isDesign ? classes.cardWrapper : classes.cardWrap}
        onMouseEnter={() => setIsInfoRowWhite(true)}
        onMouseLeave={() => setIsInfoRowWhite(false)}>
        {isTimeTag ? (
          <div className={classes.timeTagWrap}>
            {saleType === TokenSaleType.Ask ? (
              <span className={isInfoRowWhite ? classes.onSaleShow : classes.onSale}>
                <EverIcon />
                <span>{useSmallPrice(timeTagProps.currentPrice) ?? 0}</span>
              </span>
            ) : (
              <TimeTag
                time={
                  isDesktopWidth
                    ? TimeUtil.getTimeLeft(timeTagProps.endTime)
                    : TimeUtil.getTimeLeftMobile(timeTagProps.endTime)
                }
                active={getTimeColorBoolean()}
                type="secondary"
              />
            )}
          </div>
        ) : null}

        <div className={isDesign ? classes.cardWrapper__image : classes.cardWrap__image}>
          {imageUrl ? (
            <>
              {token?.deployed?.type !== TokenType.Forever ? (
                <img
                  ref={imageRef}
                  src={
                    preview
                      ? getMediaUrl(preview?.hash, 'image', {
                          width: 300,
                          compressionQuality: 70,
                        })
                      : stampImg
                      ? getMediaUrl(stampImg?.hash, 'image', {
                          width: 300,
                          compressionQuality: 70,
                        })
                      : imageUrl
                  }
                  className={isDesign ? classes.imgD : classes.img}
                  onLoad={() => setIsImageLoaded(true)}
                  loading="lazy"
                  decoding="async"
                />
              ) : preview ? (
                <img
                  ref={imageRef}
                  src={getMediaUrl(preview?.hash, 'image', {
                    width: 300,
                    compressionQuality: 70,
                  })}
                  className={classes.img}
                  onLoad={() => setIsImageLoaded(true)}
                  loading="lazy"
                  decoding="async"
                />
              ) : (
                <Skeleton.Image
                  className={classes.antSkeletonElement}
                  style={{ width: '100% !important', height: '100%' }}
                />
              )}
            </>
          ) : innerWindowWidth < maxMobileWidth ? (
            <div style={{ width: '100%', height: '100%' }}>
              <Skeleton.Image
                className={classes.antSkeletonElement}
                style={{ width: '100% !important', height: '100%' }}
              />
            </div>
          ) : (
            <Skeleton.Image style={{ width: '300px', height: '100%' }} />
          )}
        </div>

        <Link
          href={`/token/${token?.raw?.type}/${
            token?.tokenID || (token?.seriesID && `${token?.seriesID}/series`)
          }`}>
          <a>
            <div className={isDesign ? classes.cardWrapper_active : classes.cardWrap_active}>
              {isDesign ? (
                <>
                  <div className={classes.cardHeader}>{header}</div>
                  <div>
                    <div
                      className={
                        isDesign
                          ? classes.cardWrapper_active__cardName__wrap
                          : classes.cardWrap_active__cardName__wrap
                      }>
                      <span className={classes.cardWrap_active__cardName}>
                        {getTruncatedString(cardName || '', 76)}
                      </span>
                    </div>
                    <div
                      className={
                        isDesign
                          ? classes.cardWrapper_active__edition__wrap
                          : classes.cardWrap_active__edition__wrap
                      }>
                      <span className={classes.cardWrap_active__edition}>
                        {editionPrefix} {currentEdition} of {totalEdition}
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div>{header}</div>
                  <div>
                    {mimetype?.includes('video') ? (
                      <VideoIcon
                        className={classes.cardWrap_previewIcon}
                        style={
                          videoModal ? { opacity: 0, zIndex: 1001 } : { opacity: 1, zIndex: 1 }
                        }
                        onClick={handleMouseClick}
                        onMouseEnter={handleMouseEnter}
                        onMouseLeave={handleMouseLeave}
                      />
                    ) : (
                      <FullScreenIcon
                        className={classes.cardWrap_previewIcon}
                        style={
                          videoModal ? { opacity: 0, zIndex: 1001 } : { opacity: 1, zIndex: 1 }
                        }
                        onClick={handleMouseClick}
                        onMouseEnter={handleMouseEnter}
                        onMouseLeave={handleMouseLeave}
                      />
                    )}
                    <span className={classes.descriptionText}>
                      {getTruncatedString(cardSubName || '', 64)}
                    </span>
                  </div>
                </>
              )}
            </div>
          </a>
        </Link>

        {isDesign && (
          <div
            className={classes.cardWrapper_bottomRow}
            style={{ background: isInfoRowWhite ? '#ffffff' : '#f5f5f7' }}>
            <div className={classes.cardWrapper_infoRow}>
              <div className={classes.cardWrapper_infoRow__leftBlock}>
                {creatorAvatarHash ? (
                  <Link href={`/user/${creatorLink}`}>
                    <a>
                      <img
                        alt="avatar"
                        src={getMediaUrl(creatorAvatarHash, 'image', {
                          width: 50,
                          height: 50,
                          compressionQuality: 70,
                        })}
                        width={50}
                        height={50}
                        className={classes.cardWrapper_bottomRow__author}
                        style={{ borderRadius: '50%', objectFit: 'cover' }}
                        loading="lazy"
                        decoding="async"
                      />
                    </a>
                  </Link>
                ) : (
                  <Link href={`/user/${token?.deployed?.creator}`}>
                    <a>
                      <div
                        className={classes.cardWrapper_bottomRow__author}
                        style={{ borderRadius: '50%', objectFit: 'cover' }}>
                        <Skeleton.Avatar style={{ width: 50, height: 50, background: '#cccccc' }} />
                      </div>
                    </a>
                  </Link>
                )}

                <div className={classes.cardWrapper_tokenStatus}>
                  <div>
                    <span className={classes.status}>
                      {frontStatus === 'ACCEPTING BIDS' ? '' : frontStatus}
                    </span>
                  </div>
                </div>
              </div>

              <div className={classes.cardWrapper_infoRow__rightBlock}>
                {!token?.seriesID && (
                  <LikeBlock
                    token={token || undefined}
                    className={classes.like}
                    shareModal={false}
                    likeData={likeData}
                  />
                )}

                {mimetype?.includes('video') ? (
                  <VideoIcon
                    className={classes.cardWrap_previewIcon}
                    style={videoModal ? { opacity: 0, zIndex: 1001 } : { opacity: 1, zIndex: 1 }}
                    onClick={handleMouseClick}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                  />
                ) : (
                  <FullScreenIcon
                    className={classes.cardWrap_previewIcon}
                    style={videoModal ? { opacity: 0, zIndex: 1001 } : { opacity: 1, zIndex: 1 }}
                    onClick={handleMouseClick}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                  />
                )}
              </div>
            </div>
          </div>
        )}

        <div style={{ display: 'none', position: 'absolute' }}>
          <MediaPreview
            hash={hash}
            subtitle="subtitle"
            number={2}
            meta={{ width, height, mimetype, weight }}
            title={cardName ?? ''}
            hint={`${currentEdition} of ${totalEdition}`}
            subtitleText={cardSubName || ''}
            imageArrayLength={2}
            openCardModal={isFullImageClick ? isFullImageClick : videoModal}
            closePreview={closePreview}
            closeVideoModal={closeVideoModal}
            stampSrc={preview?.hash}
            stamp={Boolean(preview)}
            isForever={token.deployed?.type === TokenType.Forever}
            noLineUnderCard
          />
        </div>
      </div>

      {!isDesign && (
        <div className={classes.underBlockWrapper}>
          {creatorAvatarHash ? (
            <Link href={`/user/${creatorLink}`}>
              <a>
                <img
                  alt="avatar"
                  src={getMediaUrl(creatorAvatarHash, 'image', {
                    width: 32,
                    height: 32,
                    compressionQuality: 70,
                  })}
                  width={32}
                  height={32}
                  style={{ borderRadius: '50%', objectFit: 'cover' }}
                  loading="lazy"
                  decoding="async"
                />
              </a>
            </Link>
          ) : (
            <Link href={`/user/${token?.deployed?.creator}`}>
              <a>
                <div style={{ borderRadius: '50%', objectFit: 'cover' }}>
                  <Skeleton.Avatar style={{ width: 32, height: 32, background: '#cccccc' }} />
                </div>
              </a>
            </Link>
          )}
          <div>
            <span>
              <Link
                href={`/token/${token?.raw?.type}/${
                  token?.tokenID || (token?.seriesID && `${token?.seriesID}/series`)
                }`}>
                <a>{getTruncatedString(cardName || '', 26)}</a>
              </Link>
            </span>
            <span>
              {editionPrefix} {currentEdition} of {totalEdition}
            </span>
          </div>
        </div>
      )}
    </>
  );
};

export default Card;

interface Props {
  cardName: string | undefined;
  cardSubName: string | undefined;
  image: ImageConfig;
  totalEdition: number | undefined;
  currentEdition: number | undefined;
  editionPrefix?: string;
  header: View;
  hash?: any;
  token?: any;
  user?: any;
  setToken: (v: ITokenInfoDto) => void;
  videoModal?: boolean;
  closeVideoModal?: any;
  isDesign?: boolean;
  askPrice?: number | undefined;
  saleType?: TokenSaleType;
  likeData?: any;
  setVideoModal?: any;
  setIsShownHoverContent?: any;
  timeTagProps?: any;
  frontStatus?: string;
}

interface ImageConfig {
  url?: string;
  isLoaded: boolean;
  setIsLoaded: (isLoaded: boolean) => void;
}
