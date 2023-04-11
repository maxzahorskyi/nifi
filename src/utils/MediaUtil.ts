import round from './round';
import convertBytesToMegabytes from './convertBytesToMegabytes';
import mime from 'mime-types';

class MediaUtil {
  public static fitMedia({ width, height, maxWidth, maxHeight }: MediaParams) {
    let fitWidth = Math.min(width, maxWidth);
    let fitHeight = (height / width) * fitWidth;

    if (fitHeight > maxHeight) {
      fitHeight = Math.min(height, maxHeight);
      fitWidth = (width / height) * fitHeight;
    }

    return {
      fitHeight,
      fitWidth,
    };
  }

  public static prepareWeight(weightToPrepare: number | undefined = 0) {
    return round(convertBytesToMegabytes(weightToPrepare), 2);
  }

  public static prepareMimetype(mimetypeToPrepare: string | undefined) {
    if (!mimetypeToPrepare) {
      return '';
    }

    const extension = mime.extension(mimetypeToPrepare);

    if (!extension) {
      return '';
    }

    return extension.toUpperCase();
  }
}

export default MediaUtil;

interface MediaParams {
  width: number;
  height: number;
  maxWidth: number;
  maxHeight: number;
}
