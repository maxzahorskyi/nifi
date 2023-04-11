import useAuthContext from '../useAuthContext';
import useTonClientBridge from '../useTonClientBridge';
import { Loading } from '../../features/Token/pages/TokenPage';
import { useMutation } from 'react-query';
import TokenService, { CreateAuctionDto } from '../../features/Token/TokenService';
import { message } from 'antd';
import EverSurf from '../../config/ton/EverSurf';
import TonUtil from '../../utils/TonUtil';
import TimeUtil from '../../utils/TimeUtil';
import { ITokenInfoDto } from '../../types/Tokens/TokenInfo';
import { convertFromExp } from '../../utils/convertFromExp';

export const useAuctionTransactionHandler = ({
  setLoadingByKey,
  showNoExtratonException,
}: Props) => {
  const { walletAddress } = useAuthContext();
  const tonClientBridge = useTonClientBridge();
  const auctionMutation = useMutation(TokenService.createAuction);
  const auctionBidMutation = useMutation(TokenService.createAuctionBid);

  const createAuction = async (params: {
    startBid: number;
    stepBid: number;
    startTime: number;
    endTime: number;
    superTypeAuction: string;
    token?: ITokenInfoDto;
    onSuccess: () => void;
    tonSurfSet: (values: Record<string, any>) => void;
  }) => {
    const {
      startBid,
      token,
      endTime,
      startTime,
      stepBid,
      superTypeAuction,
      onSuccess,
      tonSurfSet,
    } = params;
    if (!walletAddress) {
      showNoExtratonException();
      return;
    }

    if (!token?.deployed?.address) {
      return;
    }

    if (Date.now() - 25 * 60 * 60 * 1000 > startTime) {
      message.error("Start time shouldn't be in the past");
      setLoadingByKey('createAuction', false);
      return;
    }

    if ((startTime > Date.now() ? startTime : Date.now()) + 20 * 60 * 1000 > endTime) {
      message.error("Closing time shouldn't be in the past");
      setLoadingByKey('createAuction', false);
      return;
    }
    if (token.auction?.deployed?.auctionAddress) {
      try {
        await tonClientBridge.createAuction(
          token.deployed?.address,
          TonUtil.convertTonToNanoTon(startBid),
          TonUtil.convertTonToNanoTon(stepBid),
          TimeUtil.convertTimestampToSeconds(startTime),
          TimeUtil.convertTimestampToSeconds(endTime),
          0,
          token.auction?.deployed?.auctionAddress,
        );
        onSuccess();

        return message.success('Auction has been successfully created', 2);
      } catch (e) {
        console.log(e);
        return message.error('Creating auction was cancelled by user');
      } finally {
        setLoadingByKey('createAuction', false);
      }
    }

    try {
      setLoadingByKey('createAuction', true);

      const AuctionDto: CreateAuctionDto = {
        auctionCreator: walletAddress,
        bidStep: TonUtil.convertTonToNanoTon(stepBid).toString(),
        endTime: TimeUtil.convertTimestampToSeconds(endTime),
        showcaseFee: '0', // '500',
        startBid: TonUtil.convertTonToNanoTon(startBid).toString(),
        startTime: TimeUtil.convertTimestampToSeconds(startTime),
        superType: superTypeAuction,
        tokenAddress: token.deployed?.address,
        tokenID: token?.tokenID,
      };

      await auctionMutation.mutateAsync(AuctionDto);

      if (tonClientBridge instanceof EverSurf) {
        tonSurfSet({
          artToken: token.deployed?.address,
          startBid: TonUtil.convertTonToNanoTon(startBid),
          stepBid: TonUtil.convertTonToNanoTon(stepBid),
          startTime: TimeUtil.convertTimestampToSeconds(startTime),
          endTime: TimeUtil.convertTimestampToSeconds(endTime),
          showcaseFees: parseInt(AuctionDto.showcaseFee || '0', 10),
          tokenID: token.tokenID,
        });
        onSuccess();
        return;
      }

      await tonClientBridge.createAuction(
        token.deployed?.address,
        TonUtil.convertTonToNanoTon(startBid),
        TonUtil.convertTonToNanoTon(stepBid),
        TimeUtil.convertTimestampToSeconds(startTime),
        TimeUtil.convertTimestampToSeconds(endTime),
        +(AuctionDto.showcaseFee || '0'),
      );

      onSuccess();

      message.success('The auction has been successfully created');
    } catch (e) {
      console.log(e);
      message.error('An error occurred while creating the auction');
    } finally {
      setLoadingByKey('createAuction', false);
    }
  };

  const submitBid = async (params: {
    bidPrice: number;
    token?: ITokenInfoDto;
    onSuccess: () => void;
    tonSurfSet: (v: Record<string, any>) => void;
    userBids: number;
    minimalPrice: number;
  }) => {
    const { onSuccess, token, bidPrice, tonSurfSet, userBids, minimalPrice } = params;
    if (!walletAddress) {
      showNoExtratonException();
      return;
    }

    if (!token?.auction) {
      return;
    }

    if (minimalPrice > bidPrice) {
      message.error('Bid price should be bigger than minimal price');
      return;
    }

    try {
      setLoadingByKey('submitBid', true);

      if (tonClientBridge instanceof EverSurf) {
        tonSurfSet({
          auctionAddress: token?.auction?.deployed?.auctionAddress || '',
          bid: TonUtil.convertTonToNanoTon(bidPrice),
          userBids,
        });
        onSuccess();
        return;
      }

      await tonClientBridge.makeBidAuction(
        token?.auction?.deployed?.auctionAddress || '',
        TonUtil.convertTonToNanoTon(bidPrice),
      );

      await auctionBidMutation.mutateAsync({
        bid: {
          bidCreator: walletAddress,
          bidValue: convertFromExp(TonUtil.convertTonToNanoTon(bidPrice)) || '',
        },
        auctionID: token?.auction?.auctionID || '',
      });

      onSuccess();

      message.success('The bid has been successfully submitted');
    } catch (e) {
      console.log(e);
      message.error('An error occurred while submitting the bid');
    } finally {
      setLoadingByKey('submitBid', false);
    }
  };

  return { createAuction, submitBid };
};

interface Props {
  setLoadingByKey: (key: keyof Loading, value: boolean, onToggle?: Function) => void;
  showNoExtratonException: () => void;
}
