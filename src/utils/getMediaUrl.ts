import { ImageParams } from '../config/http/MediaService';
import qs from 'query-string';
import getConfig from 'next/config';

const config = getConfig().publicRuntimeConfig.services;
const types = {
  video: config.mediaUrl,
  'video/preview': config.mediaUrl,
  image: config.mediaUrl,
  ipfs: config.ipfsUrl,
};

const getMediaUrl = (hash: string, type: MediaUrlType, params?: ImageParams) => {
  const query = qs.stringify(params || {});
  return `${types[type]}/${hash}${type === 'video/preview' ? '/preview' : ''}${
    query && type !== 'ipfs' ? `?${query}` : ''
  }`;
};

export type MediaUrlType = 'video' | 'image' | 'ipfs' | 'video/preview';

export default getMediaUrl;
