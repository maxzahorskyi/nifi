import { ImageParams } from '../config/http/MediaService';
import getMediaUrl from '../utils/getMediaUrl';

const useImageUrl = (hash: string | undefined, params?: ImageParams) => {
  if (!hash) {
    return undefined;
  }

  return getMediaUrl(hash, 'image', params);
};

export default useImageUrl;
