import useAuthContext from '../useAuthContext';
import useTonClientBridge from '../useTonClientBridge';
import { Loading } from '../../features/Token/pages/TokenPage';
import { useMutation } from 'react-query';
import TokenService, { CreateBidDto } from '../../features/Token/TokenService';
import { message } from 'antd';
import EverSurf from '../../config/ton/EverSurf';
import TonUtil from '../../utils/TonUtil';
import TimeUtil from '../../utils/TimeUtil';
import { ITokenInfoDto } from '../../types/Tokens/TokenInfo';
import { convertFromExp } from '../../utils/convertFromExp';
import { TokenSaleInfo } from '../../types/Tokens/Token';

export const useBidTransactionHandler = ({ setLoadingByKey, showNoExtratonException }: Props) => {
  const { walletAddress } = useAuthContext();
  const tonClientBridge = useTonClientBridge();
  const bidMutation = useMutation(TokenService.createBid);

  const submitOffer = async (params: {
    offerPrice: number;
    endTime: number;
    token?: ITokenInfoDto;
    superType: string;
    onSuccess: (id?: string, parentAddress?: string) => void;
    tonSurfSet: (v: Record<string, any>) => void;
  }) => {
    const { offerPrice, endTime, token, superType, onSuccess, tonSurfSet } = params;
    if (!walletAddress) {
      showNoExtratonException();
      return;
    }

    if (!token?.deployed?.address) {
      return;
    }

    if (Date.now() + 20 * 60 * 1000 > endTime) {
      message.error("Closing time shouldn't be in the past");
      return;
    }

    try {
      const BidDto: CreateBidDto = {
        tokenID: token?.tokenID || '',
        bidCreator: walletAddress || '',
        bidValue: convertFromExp(TonUtil.convertTonToNanoTon(offerPrice)) || '',
        endTime: TimeUtil.convertTimestampToSeconds(endTime),
        tokenAddress: token?.deployed.address || '',
        superType,
      };

      await bidMutation.mutateAsync(BidDto);

      setLoadingByKey('submitOffer', true);

      if (tonClientBridge instanceof EverSurf) {
        tonSurfSet({
          artToken: token.deployed?.address,
          price: TonUtil.convertTonToNanoTon(offerPrice),
          endTime: TimeUtil.convertTimestampToSeconds(endTime),
        });
        onSuccess();
        return;
      }
      const offer = await tonClientBridge.createBid(
        token.deployed?.address,
        TonUtil.convertTonToNanoTon(offerPrice),
        TimeUtil.convertTimestampToSeconds(endTime),
      );
      onSuccess(offer.id, offer.parentAddress);

      message.success('The bid has been successfully submitted');
    } catch (e) {
      console.log(e);
      message.error('An error occurred while submitting the bid');
    } finally {
      setLoadingByKey('submitOffer', false);
    }
  };

  const acceptBestOffer = async (params: {
    saleInfo: TokenSaleInfo;
    onSuccess: () => void;
    onError: () => void;
    tonSurfSet: (v: Record<string, any>) => void;
    proceedAddress?: string;
  }) => {
    const { saleInfo, proceedAddress, onSuccess, tonSurfSet, onError } = params;
    if (!walletAddress) {
      showNoExtratonException();
      return;
    }

    if (!saleInfo) {
      return;
    }

    const { bestOffer } = saleInfo;

    if (!bestOffer) {
      return;
    }
    if (proceedAddress) {
      try {
        await tonClientBridge.acceptBid(bestOffer.deployed.bidAddress, proceedAddress);
        onSuccess();
        setLoadingByKey('acceptOffer', false);
        return message.success('The bid has been successfully accepted', 2);
      } catch (e) {
        console.log(e);
        setLoadingByKey('acceptOffer', false);
        onError();
        return message.error('Accepting bid was cancelled by user');
      }
    }

    try {
      if (tonClientBridge instanceof EverSurf) {
        setLoadingByKey('acceptOffer', true);
        tonSurfSet({
          bidAddress: bestOffer.deployed.bidAddress,
          bidCreator: bestOffer.deployed.bidCreator,
          endTime: bestOffer.deployed.endTime,
          tokenAddress: bestOffer.deployed.tokenAddress,
        });
        onSuccess();
        return;
      }

      await tonClientBridge.acceptBid(bestOffer.deployed.bidAddress);

      onSuccess();

      message.success('The bid has been successfully accepted');
    } catch (e) {
      console.log(e);
      message.error('An error occurred while accepting the bid');
    } finally {
      setLoadingByKey('acceptOffer', false);
    }
  };

  return { submitOffer, acceptBestOffer };
};

interface Props {
  setLoadingByKey: (key: keyof Loading, value: boolean, onToggle?: Function) => void;
  showNoExtratonException: () => void;
}
