import { message } from 'antd';
import TonUtil from '../../../utils/TonUtil';
import TonClientBridge, { COL_ROOT_ADDR } from '../../../config/ton/Extraton';
import { UseMutationResult } from 'react-query';
import FeeUtil from '../../../utils/FeeUtil';
import { PostImageResponse } from '../../../config/http/MediaService';
import { FormMedia } from '../pages/CollectiblePageCreate';
import { SeriesDto } from '../../../config/http/CollectiblesService';
import EverSurf from '../../../config/ton/EverSurf';
import EverWallet from '../../../config/ton/EverWallet';

export class CollectiblesUtil {
  private readonly walletAddress: string | undefined;
  private readonly imageMutation;
  private readonly tonClientBridge;
  private readonly showNoExtratonException;
  private readonly seriesMutation;

  constructor(
    walletAddress: string | undefined,
    imageMutation: UseMutationResult<PostImageResponse, unknown, Blob, unknown> | undefined,
    tonClientBridge: TonClientBridge | EverSurf | EverWallet,
    showNoExtratonException: () => void,
    seriesMutation: UseMutationResult<PostImageResponse, unknown, SeriesDto, unknown> | undefined,
  ) {
    this.walletAddress = walletAddress;
    this.imageMutation = imageMutation;
    this.tonClientBridge = tonClientBridge;
    this.showNoExtratonException = showNoExtratonException;
    this.seriesMutation = seriesMutation;
  }

  public createCollectible = async (params: {
    onSuccess: (seriesId: string) => void;
    layers: Array<FormMedia[]>;
    mintCost: number;
    name: string;
    symbol: string;
    creatorFees: number;
    limit: number;
    description: string | undefined;
    startTime: number;
    layersNames: string[];
  }) => {
    const {
      layersNames,
      creatorFees,
      symbol,
      name,
      mintCost,
      layers,
      limit,
      onSuccess,
      description,
      startTime,
    } = params;
    if (!this.walletAddress) {
      this.showNoExtratonException();
      return;
    }

    try {
      const hashes: Array<string[]> = await Promise.all(
        layers.map(async (layer) => {
          // eslint-disable-next-line no-return-await
          return await Promise.all(
            layer.map(async (image) => {
              const data = await this.imageMutation?.mutateAsync(image.file);
              return data?.hash || '';
            }),
          );
        }),
      );

      const data = await this.seriesMutation?.mutateAsync({
        name,
        description,
        layers: layers.map((layer, layerNum) => ({
          layer: layersNames[layerNum] || '',
          images: layer.map((image, imageNum) => ({
            subtitle: image.subtitle,
            hash: hashes[layerNum]?.[imageNum] || '',
            mimetype: image.file.type,
            width: image.width,
            height: image.height,
            weight: image.file.size,
            rarity: image.rarity,
          })),
        })),
        creatorFees: FeeUtil.toBlockchainFormat(creatorFees),
        mintCost: TonUtil.convertTonToNanoTon(mintCost),
        creator: this.walletAddress,
        maximum: limit,
        startTime,
      });

      if (!data?.hash) {
        message.error('Blockchain deploy error');
        return;
      }

      const { id } = await this.tonClientBridge.createCollectibles(
        limit,
        hashes,
        name,
        symbol,
        FeeUtil.toBlockchainFormat(creatorFees),
        TonUtil.convertTonToNanoTon(mintCost),
        data?.hash || '',
        startTime,
      );

      onSuccess(`${COL_ROOT_ADDR}__${id}`);
      message.success('The bid has been successfully submitted');
    } catch (e) {
      console.log(e);
      message.error('An error occurred while submitting the bid');
    }
  };

  public mintToken = async (params: {
    onExecute: () => void;
    onSuccess: (time: number) => void;
    onError: () => void;
    seriesAddress: string;
    mintCost: number;
  }) => {
    const { seriesAddress, onSuccess, mintCost, onExecute } = params;
    if (!this.walletAddress) {
      this.showNoExtratonException();
      return;
    }

    try {
      onExecute();
      await this.tonClientBridge.mintCollectible(seriesAddress, mintCost);

      onSuccess(Math.round(new Date().getTime() / 1000));
      message.success('The bid has been successfully submitted');
    } catch (e) {
      console.log(e);
      message.error('An error occurred while submitting the bid');
    }
  };
}

export const initialSetUpAskFromValue = {
  endTime: 0,
  price: 0,
};
