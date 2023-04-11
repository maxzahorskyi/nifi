import useAuthContext from '../useAuthContext';
import useTonClientBridge from '../useTonClientBridge';
import { Loading } from '../../features/Token/pages/TokenPage';
import { useMutation } from 'react-query';
import TokenService, {
  CreateTokenInfoDto,
  MediaDto,
  TokenType,
} from '../../features/Token/TokenService';
import { message } from 'antd';
import EverSurf from '../../config/ton/EverSurf';
import { ITokenInfoDto } from '../../types/Tokens/TokenInfo';
import { convertFromExp } from '../../utils/convertFromExp';
import FeeUtil from '../../utils/FeeUtil';
import { generateTokenId } from '../../utils/TokenUtil';
import MediaService from '../../config/http/MediaService';
import { GQLSeries, GQLUser } from '../../types/graphql.schema';
import { FormMedia, FormValues } from '../../types/Tokens/Token';
import { mintSealToken, mintStampToken } from '../../config/binance/Tokens';

export const useTokenTransactionHandler = ({ setLoadingByKey, showNoExtratonException }: Props) => {
  const { walletAddress } = useAuthContext();
  const tonClientBridge = useTonClientBridge();
  const likeMutation = useMutation(TokenService.like);
  const sendMutation = useMutation(TokenService.send);
  const tokenMutation = useMutation(TokenService.createTokenInfo);
  const mediaMutation = useMutation(MediaService.post);
  const imagesMergeMutation = useMutation(MediaService.merge);

  const sendToken = async (params: {
    receiverAddress: string;
    token?: ITokenInfoDto;
    onSuccess: (receiverAddress: string) => void;
    tonSurfSet: (v: Record<string, any>) => void;
  }) => {
    const { receiverAddress, token, onSuccess, tonSurfSet } = params;
    if (!walletAddress) {
      showNoExtratonException();
      return;
    }

    if (!token?.deployed?.address || !setLoadingByKey) {
      return;
    }

    setLoadingByKey('sendToken', true);
    try {
      if (tonClientBridge instanceof EverSurf) {
        tonSurfSet({
          artTokenAddr: token.deployed.address,
          newOwner: receiverAddress,
        });
        await sendMutation.mutateAsync({
          tokenID: token.tokenID || '',
          walletAddress: receiverAddress,
        });
        onSuccess(receiverAddress);
        return;
      }

      await tonClientBridge.changeOwnerArtToken(token.deployed.address, receiverAddress);

      await sendMutation.mutateAsync({
        tokenID: token.tokenID || '',
        walletAddress: receiverAddress,
      });

      onSuccess(receiverAddress);

      message.success('The token has been successfully sent');
    } catch (e) {
      console.log(e);
      message.error('An error occurred while sending the token');
    } finally {
      setLoadingByKey('sendToken', false);
    }
  };

  const createToken = async <T extends FormValues>(params: {
    token: T;
    blockchain?: string;
    media?: FormMedia[];
    superType: string;
    tonSurfSet: (v: Record<string, any>) => void;
    onSuccess: (v: string) => void;
  }) => {
    setLoadingByKey('savingToken', true);
    const { media, superType, token, tonSurfSet, onSuccess, blockchain } = params;

    if (!walletAddress) {
      showNoExtratonException();
      return;
    }

    if (!mediaMutation || !media) {
      return;
    }

    try {
      const mediaDtos: MediaDto[] = await Promise.all(
        media.map(({ file, subtitle, width, height, role }) =>
          mediaMutation.mutateAsync(file).then(({ hash }) => {
            return {
              hash,
              subtitle,
              width,
              height,
              mimetype: file.type,
              weight: file.size,
              role,
            };
          }),
        ),
      );

      if (token.type === TokenType.Stamp) {
        let images = [
          mediaDtos.find((item) => item.role === 'image'),
          ...(mediaDtos.find((item) => item.role === 'frame')
            ? [mediaDtos.find((item) => item.role === 'frame')]
            : []),
        ];
        const res =
          images?.[1] && images?.[1]?.hash?.length > 0
            ? await imagesMergeMutation?.mutateAsync(
                images.map((item) => {
                  return {
                    hash: item?.hash || '',
                    type: item?.role || '',
                    width: mediaDtos[0]?.width,
                    height: mediaDtos[0]?.height,
                  };
                }),
              )
            : { hash: images[0]?.hash };
        const preview = {
          hash: res?.hash || '',
          subtitle: '',
          width: mediaDtos[0]?.width || 0,
          height: mediaDtos[0]?.height || 0,
          mimetype: 'image/png',
          weight: 0,
          role: 'preview',
        };
        images.push(preview);
        images.forEach((item, key) => {
          mediaDtos[key] = item as MediaDto;
        });
      }

      const tokenDto: CreateTokenInfoDto = {
        title: token.title,
        description: token.description,
        numberOfEditions: token.numberOfEditions,
        type: token.type,
        collectionID: token.collectionID,
        creatorFees: convertFromExp(FeeUtil.toBlockchainFormat(token.fee)) || '',
        creator: walletAddress,
        media: [...mediaDtos],
        superType,
        owner: token.type !== TokenType.Art2 ? walletAddress : undefined,
        qualification: 0,
        blockchain,
      };

      const hashRes = await tokenMutation?.mutateAsync(tokenDto);
      const hash: string | undefined = hashRes?.hash;

      setLoadingByKey('savedOnBack', true);

      message.success('Token has been successfully saved');

      if (tonClientBridge instanceof EverSurf) {
        if (tokenDto.type === TokenType.Art2 && hash) {
          tonSurfSet({
            dirtyHash: hash,
            limit: tokenDto.numberOfEditions,
            dirtyCreatorFees: token.fee,
          });
        } else {
          tonSurfSet({
            dirtyHash: hash,
            dirtyCreatorFee: token.fee,
            type: tokenDto.type,
          });
        }
        onSuccess('');
        return;
      }

      if (blockchain === 'everscale') {
        if (tokenDto.type === TokenType.Art2 && hash && blockchain) {
          const { id, parentAddress } = await tonClientBridge.createArt2Serie(
            hash,
            tokenDto.numberOfEditions,
            token.fee,
          );

          const seriesID = generateTokenId(Number(id), [], parentAddress);
          onSuccess(seriesID);
        } else if (hash) {
          const { id, parentAddress } = await tonClientBridge.createToken(
            hash,
            token.fee,
            tokenDto.type,
          );

          const tokenId = generateTokenId(Number(id), [], parentAddress);

          onSuccess(tokenId);
        }
      }

      // !ADD BINANCE BLOCKHAIN SEAL MINT
      if (blockchain === 'binance' && tokenDto.type === TokenType.Stamp) {
        await mintStampToken(tokenDto);
        onSuccess('');
      }
      if (blockchain === 'binance' && tokenDto.type === TokenType.Seal) {
        await mintSealToken(tokenDto);
        onSuccess('');
      }

      message.success('Token has been added to blockchain');
    } catch (e) {
      console.log(e);
      message.error('An error occurred while creating the token');
    } finally {
      setLoadingByKey('tokenCreated', true);
    }
  };

  const like = (params: {
    token?: ITokenInfoDto;
    series?: GQLSeries;
    user?: GQLUser;
    setSeries?: (v: GQLSeries) => void;
    setToken: (v: ITokenInfoDto) => void;
  }) => {
    const { token, user, series, setToken, setSeries } = params;

    if (!token || !user || !token.tokenID) {
      return;
    }

    const removeLike = () => {
      if (!token?.raw) return;
      if (token?.deployed?.seriesID?.seriesID && setSeries) {
        setSeries({
          ...series,
          raw: {
            ...series?.raw,
          },
        });
      } else {
        setToken({
          ...token,
          raw: {
            ...token?.raw,
          },
        });
      }
    };

    const addLike = () => {
      if (!token?.tokenID) return;
      if (token?.deployed?.seriesID?.seriesID && setSeries) {
        setSeries({
          ...series,
          raw: {
            ...series?.raw,
          },
        });
      } else {
        setToken({
          ...token,
          raw: {
            ...token?.raw,
          },
        });
      }
    };

    likeMutation?.mutate(
      {
        tokenID: token.tokenID,
        accountNumber: user.accountNumber!,
        walletAddress: user.walletAddress!,
        type: token?.deployed?.type as TokenType,
        seriesID: token?.deployed?.seriesID?.seriesID || undefined,
      },
      {
        onSuccess: (likedData: likedData | any) => {
          if (!likedData.hasLike) {
            removeLike();
          } else {
            addLike();
          }
        },
        onError: (error: any) => {
          message.error(error.message);
        },
      },
    );
  };

  return { sendToken, createToken, like };
};

interface Props {
  setLoadingByKey: (key: keyof Loading, value: boolean, onToggle?: Function) => void;
  showNoExtratonException: () => void;
  type: TokenType;
}

interface likedData {
  likesCount: number;
  hasLike: boolean;
}
