import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import getConfig from 'next/config';

export const mediaServiceUrl = getConfig().publicRuntimeConfig.services.mediaUrl;
const axiosInstance = axios.create({
  baseURL: mediaServiceUrl,
});

class MediaService {
  public static axiosInstance: AxiosInstance = axios;

  public static get(hash: string, params?: ImageParams): Promise<Blob> {
    return axiosInstance.get(`/:${hash}`, {
      params,
      responseType: 'blob',
    });
  }

  public static post(media: Blob, config?: AxiosRequestConfig): Promise<PostImageResponse> {
    const postImageFormData = new FormData();
    postImageFormData.append('media', media);

    return axiosInstance.post('/', postImageFormData, config).then((res) => res.data.data);
  }

  public static merge(hashes: { hash: string; type: string; corner?: Corners }[]) {
    return axiosInstance
      .post<Response>('/merge', {
        hashes,
      })
      .then((res) => {
        // @ts-ignore
        return res.data.data;
      });
  }
}

type Response = { hash?: string; success: boolean };

export interface ImageParams {
  width?: number;
  height?: number;
  compressionQuality?: 70 | 100;
}

export interface PostImageResponse {
  hash: string;
}

export default MediaService;

export enum Corners {
  SW = 'SW',
  SE = 'SE',
  NE = 'NE',
  NW = 'NW',
}
