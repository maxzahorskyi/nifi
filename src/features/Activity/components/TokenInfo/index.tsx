import { GQLAction, GQLCollection, GQLSeries, GQLToken } from '../../../../types/graphql.schema';
import parseTokenId from '../../../../utils/TokenUtil';
import formatDistance from 'date-fns/formatDistance';
import Link from 'next/link';
import cn from 'classnames';
import classes from '../../pages/ActivityPage/index.module.scss';
import getMediaUrl from '../../../../utils/getMediaUrl';
import { Skeleton } from 'antd';
import AddressUtil from '../../../../utils/AddressUtil';
import React from 'react';
import ActivityUtils from '../../utils/ActivityUtils';
import getConfig from 'next/config';
import BlockchainIcon from '../../../../components/BlockchainIcon';

const getTruncatedString = (str: string, maxLength: number) =>
  str.length > maxLength ? `${str.slice(0, maxLength)}...` : str;

const TokenInfo = ({ action, seriesArray, collectionArray, tokens, isMobile }: Props) => {
  const [token, setToken] = React.useState<GQLToken | GQLSeries | undefined>();
  const [link, setLink] = React.useState<string>('');
  const [edition, setEdition] = React.useState<string | undefined>();
  const Image = token?.raw?.media?.[0]?.hash;
  const Video = token?.raw?.media?.find(({ mimetype }: any) => mimetype.includes('video'))?.hash;
  // console.log(tokens)
  const previewStamp = token?.raw?.media?.find(({ role }: any) => role === 'preview')?.hash;

  const date = () => {
    if (action?.message?.time) {
      return formatDistance(
        new Date(action?.message?.time ? action?.message.time * 1000 : 1),
        new Date(),
        { addSuffix: true },
      );
    }
    return 1;
  };

  React.useEffect(() => {
    if (
      action.tokenAttributes?.seriesID?.seriesID &&
      action?.message?.actionCode?.code === 'SR-CT' &&
      seriesArray
    ) {
      const series = seriesArray?.find((series) => {
        return series.seriesID === action.tokenAttributes?.seriesID?.seriesID;
      });
      setToken(series);
      setEdition('series');
      setLink(ActivityUtils.resolveTokenLinkByToken({ series }));
    }
    if (action?.message?.actionCode?.code === 'COL-CT' && seriesArray) {
      const collection = collectionArray?.find((collection) => {
        return collection.collectionID === action.message?.senderID;
      });
      setToken(collection);
      setEdition('collection');
      setLink(ActivityUtils.resolveTokenLinkByToken({ collection }));
    }
    if (action.tokenAttributes?.tokenID && tokens) {
      const tokenTMP = tokens?.find((item) => {
        return item.tokenID === action.tokenAttributes?.tokenID;
      });
      setToken(
        tokens?.find((item) => {
          return item.tokenID === action.tokenAttributes?.tokenID;
        }),
      );
      setEdition(
        `${
          tokenTMP?.deployed?.type === 'art2' && 'tokenID' in tokenTMP
            ? parseTokenId(tokenTMP.tokenID as string).tokenId
            : 1
        } of ${
          tokenTMP?.deployed?.type === 'art2' && 'seriesID' in tokenTMP?.deployed
            ? tokenTMP?.deployed?.seriesID?.deployed?.maximum
            : 1
        }`,
      );
      setLink(ActivityUtils.resolveTokenLinkByToken({ token: tokenTMP }));
    }
  }, [action, seriesArray, collectionArray, tokens]);

  const blockchain = token?.raw?.blockchain ? 'binance' : 'everscale';

  return (
    <Link href={link}>
      <a>
        <span className={cn(classes.token, 'link')}>
          <div className={classes.token__image}>
            {Image ? (
              <img
                src={
                  previewStamp
                    ? getMediaUrl(previewStamp, 'image', {
                        width: 68,
                        height: 68,
                        compressionQuality: 70,
                      })
                    : getMediaUrl(Video ? Video : Image, Video ? 'video/preview' : 'image', {
                        width: 68,
                        height: 68,
                        compressionQuality: 70,
                      })
                }
                width={68}
                height={68}
                alt={token?.raw?.media?.[0]?.subtitle}
                style={{ objectFit: 'cover' }}
              />
            ) : (
              <Skeleton.Image style={{ width: '68px', height: '68px' }} />
            )}
          </div>
          {isMobile ? (
            <span className={classes.infoColumn}>
              <span>{token?.raw?.title ?? AddressUtil.shorten(action.message?.senderAddress)}</span>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                {edition !== 'series' && (
                  <BlockchainIcon
                    blockchain={blockchain}
                    className={classes.edition__icon}
                    imgClassName={classes.edition__icon__img}
                  />
                )}
                <span>{edition}</span>
              </div>
              <span>{date()}</span>
            </span>
          ) : (
            <span>{token?.raw?.title ?? AddressUtil.shorten(action.message?.senderAddress)}</span>
          )}
        </span>
      </a>
    </Link>
  );
};

interface Props {
  action: GQLAction;
  seriesArray?: GQLSeries[];
  collectionArray?: GQLCollection[];
  tokens?: GQLToken[];
  isMobile?: boolean;
}

export default TokenInfo;
