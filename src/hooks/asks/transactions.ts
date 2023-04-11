import useAuthContext from '../useAuthContext';
import useTonClientBridge from '../useTonClientBridge';
import { Loading } from '../../features/Token/pages/TokenPage';
import { useMutation } from 'react-query';
import TokenService, { AskValue, CreateAskDto } from '../../features/Token/TokenService';
import { message } from 'antd';
import EverSurf from '../../config/ton/EverSurf';
import { GQLAsk, GQLAskRaw, GQLToken } from '../../types/graphql.schema';
import TonUtil from '../../utils/TonUtil';
import TimeUtil from '../../utils/TimeUtil';
import { ITokenInfoDto } from '../../types/Tokens/TokenInfo';

export const useAskTransactionsHandler = ({ setLoadingByKey, showNoExtratonException }: Props) => {
  const { walletAddress } = useAuthContext();
  const tonClientBridge = useTonClientBridge();
  const askMutation = useMutation(TokenService.createAsk);
  const askChangeMutation = useMutation(TokenService.changeAsk);

  const acceptAsk = async ({
    price,
    askAddress,
    onSuccess,
    tokenID,
    tonSurfSet,
  }: {
    askAddress: string | undefined;
    tokenID: string | undefined;
    onSuccess: () => void;
    price: number;
    tonSurfSet: (v: Record<string, any>) => void;
  }) => {
    if (!walletAddress) {
      showNoExtratonException();
      return;
    }

    if (!askAddress || !tokenID) {
      message.error('ask address error');
      return;
    }

    try {
      setLoadingByKey('acceptAsk', true);
      if (tonClientBridge instanceof EverSurf) {
        tonSurfSet({
          askAddress,
          price,
        });
        onSuccess();
        return;
      }

      await tonClientBridge.acceptAsk(askAddress, price);
      onSuccess();
    } catch (e) {
      console.log(e);
      message.error('ask accepting error');
    } finally {
      setLoadingByKey('acceptAsk', false);
    }
  };

  const createAsk = async ({
    price,
    endTime,
    token,
    superTypeAsk,
    onSuccess,
    tonSurfSet,
  }: {
    price: number;
    endTime: number;
    token: ITokenInfoDto | undefined;
    superTypeAsk: string;
    onSuccess: () => void;
    tonSurfSet: (v: Record<string, any>) => void;
  }) => {
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
    if (token.ask?.deployed?.askAddress) {
      try {
        await tonClientBridge.createAsk(
          walletAddress,
          token.deployed?.address,
          TonUtil.convertTonToNanoTon(price),
          TimeUtil.convertTimestampToSeconds(endTime),
          0,
          token.ask?.deployed?.askAddress,
        );
        onSuccess();
        setLoadingByKey('createAsk', false);
        return message.success('Sale offer has been successfully created', 2);
      } catch (e) {
        console.log(e);
        message.error('Creating ask was cancelled by user');
        return setLoadingByKey('createAsk', false);
      }
    }

    try {
      const AskDto: CreateAskDto = {
        askCreator: walletAddress,
        currentAskValue: TonUtil.convertTonToNanoTon(price).toString(),
        values: [
          {
            askTime: TimeUtil.convertTimestampToSeconds(new Date().getTime()),
            askValue: TonUtil.convertTonToNanoTon(price).toString(),
          },
        ],
        endTime: TimeUtil.convertTimestampToSeconds(endTime),
        showcaseFee: '0',
        superType: superTypeAsk,
        tokenAddress: token.deployed?.address,
        tokenID: token?.tokenID,
      };
      await askMutation.mutateAsync(AskDto);

      if (tonClientBridge instanceof EverSurf) {
        tonSurfSet({
          creator: walletAddress,
          token: token.deployed?.address,
          price: TonUtil.convertTonToNanoTon(price),
          endTime: TimeUtil.convertTimestampToSeconds(endTime),
          showcaseFee: +(AskDto.showcaseFee || '0'),
        });
        onSuccess();
        return;
      }

      await tonClientBridge.createAsk(
        walletAddress,
        token.deployed?.address,
        TonUtil.convertTonToNanoTon(price),
        TimeUtil.convertTimestampToSeconds(endTime),
        +(AskDto.showcaseFee || '0'),
      );

      onSuccess();

      message.success('Sale offer has been successfully created');
    } catch (e) {
      console.log(e);
      message.error('An error occurred while creating sale offer');
      setLoadingByKey('createAsk', false);
    } finally {
      setLoadingByKey('createAsk', false);
    }
  };

  const cancelAsk = async ({
    askAddress,
    onSuccess,
    tonSurfSet,
  }: {
    askAddress: string;
    onSuccess: () => void;
    tonSurfSet: (v: Record<string, any>) => void;
  }) => {
    if (!walletAddress) {
      showNoExtratonException();
      return;
    }
    try {
      setLoadingByKey('cancelAsk', true);

      if (tonClientBridge instanceof EverSurf) {
        tonSurfSet({
          askAddress,
        });
        onSuccess();
        return;
      }

      await tonClientBridge.cancelAsk(askAddress);
      onSuccess();

      message.success('Sale offer has been successfully cancelled');
    } catch (e) {
      console.log(e);
      message.error('Offer cancel error');
    } finally {
      setLoadingByKey('cancelAsk', false);
    }
  };

  const changeAsk = async ({
    value,
    ask,
    onSuccess,
    tonSurfSet,
  }: {
    ask?: GQLAsk;
    value: number;
    onSuccess: (value: AskValue) => void;
    tonSurfSet: (v: Record<string, any>) => void;
  }) => {
    if (!walletAddress) {
      showNoExtratonException();
      return;
    }
    if (!ask || !ask.askID || !ask.deployed?.askAddress) {
      return;
    }
    setLoadingByKey('changeAsk', true);
    const newValue = {
      askTime: Math.round(new Date().getTime() / 1000),
      askValue: value.toString(),
    };
    const newAsk: GQLAskRaw = {
      askCreator: ask.raw?.askCreator,
      currentAskValue: newValue.askValue,
      showcaseFee: ask.raw?.showcaseFee,
      tokenID: ask.raw?.tokenID,
      superType: ask.raw?.superType,
      tokenAddress: ask.raw?.tokenAddress,
      endTime: ask.raw?.endTime,
      values: [
        ...(ask.raw?.values?.map((item) => ({
          askTime: item?.askTime,
          askValue: item?.askValue,
        })) || []),
        newValue,
      ],
    };
    try {
      if (tonClientBridge instanceof EverSurf) {
        tonSurfSet({
          askAddress: ask.deployed.askAddress,
          price: value,
          time: newValue.askTime,
        });
        onSuccess(newValue);
        return;
      }
      await tonClientBridge.changeAsk(value, ask.deployed?.askAddress);

      await askChangeMutation.mutateAsync({
        askID: ask.askID,
        ask: newAsk,
      });
      setLoadingByKey('ask', true);
      onSuccess(newValue);
    } catch (e) {
      console.log(e);
      message.error('An error occurred while changing sale price');
    } finally {
      setLoadingByKey('changeAsk', false);
    }
  };

  return { acceptAsk, createAsk, cancelAsk, changeAsk };
};

interface Props {
  setLoadingByKey: (key: keyof Loading, value: boolean, onToggle?: Function) => void;
  showNoExtratonException: () => void;
}
