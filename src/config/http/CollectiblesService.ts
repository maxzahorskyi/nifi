import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import getConfig from 'next/config';

export const colServiceUrl = getConfig().publicRuntimeConfig.services.colUrl;

const axiosInstance = axios.create({
  baseURL: colServiceUrl,
});

class CollectiblesService {
  public static axiosInstance: AxiosInstance = axios;

  public static post(image: Blob, config?: AxiosRequestConfig): Promise<PostImageResponse> {
    const postImageFormData = new FormData();
    postImageFormData.append('image', image);

    return axiosInstance
      .post('/images/upload', postImageFormData, config)
      .then((res) => res.data.data);
  }

  public static generate(
    series: SeriesDto,
    config?: AxiosRequestConfig,
  ): Promise<PostImageResponse> {
    return axiosInstance.post('/series/generate', series, config).then((res) => res.data.data);
  }
}

export interface ImageParams {
  width?: number;
  height?: number;
}

export interface PostImageResponse {
  hash: string;
}

export interface SeriesDto {
  name: string;
  maximum: number;
  mintCost: number;
  creator: string;
  creatorFees: number;
  description: string | undefined;
  layers: LayerDto[];
  startTime: number;
}

interface LayerDto {
  layer: string;
  images: ImageDto[];
}

interface ImageDto {
  subtitle: string;
  mimetype: string;
  hash: string;
  width: number;
  height: number;
  weight: number;
  rarity: number;
}

export default CollectiblesService;
