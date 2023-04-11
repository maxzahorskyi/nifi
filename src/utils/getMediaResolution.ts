const getMediaResolution = (fileOrUrl: File) => {
  if (fileOrUrl.type.includes('image')) {
    const image = new Image();

    image.src = URL.createObjectURL(fileOrUrl);

    return new Promise<MediaResolution>((resolve) => {
      image.onload = () => {
        resolve({
          width: image.width,
          height: image.height,
        });
      };

      image.onerror = () => {
        resolve({
          width: 0,
          height: 0,
        });
      };
    });
  }
  if (fileOrUrl.type.includes('video')) {
    const video = document.createElement('video');

    video.src = URL.createObjectURL(fileOrUrl);

    return new Promise<MediaResolution>((resolve) => {
      video.onloadeddata = () => {
        resolve({
          width: video.videoWidth,
          height: video.videoHeight,
        });
      };

      video.onerror = () => {
        resolve({
          width: 0,
          height: 0,
        });
      };
    });
  }
  return { width: 0, height: 0 };
};

export default getMediaResolution;

export interface MediaResolution {
  width: number;
  height: number;
}
