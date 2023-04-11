import { message } from 'antd';
import { Endorsement } from '../TokenService';
import { GQLEndorsement } from '../../../types/graphql.schema';
import TonClientBridge from '../../../config/ton/Extraton';
import { UseMutationResult } from 'react-query';
import EverSurf from '../../../config/ton/EverSurf';
import EverWallet from '../../../config/ton/EverWallet';
import TonUtil from '../../../utils/TonUtil';
import { convertFromExp } from '../../../utils/convertFromExp';

export class EndorseUtil {
  private readonly walletAddress: string | undefined;
  private readonly endorseMutation;
  private readonly tonClientBridge;

  constructor(
    walletAddress: string | undefined,
    endorseMutation: UseMutationResult<{ token?: GQLEndorsement }, unknown, Endorsement, unknown>,
    tonClientBridge: TonClientBridge | EverSurf | EverWallet,
  ) {
    this.walletAddress = walletAddress;
    this.endorseMutation = endorseMutation;
    this.tonClientBridge = tonClientBridge;
  }

  public addToForever = async ({
    stampAddress,
    foreverAddress,
    foreverID,
    setTonSurf,
    onSuccess,
    stampID,
  }: PropsFA) => {
    if (!this.walletAddress) {
      message.error("There's not valid wallet address");
      return;
    }

    try {
      if (this.tonClientBridge instanceof EverSurf) {
        setTonSurf({
          foreverAddress,
          stampAddress,
          foreverID,
          stampID,
        });
        onSuccess(foreverID);
        return;
      }

      await this.tonClientBridge.addStamp(stampAddress, foreverAddress);
      onSuccess(foreverID);
    } catch (e) {
      message.error('Endorsement creation error');
      console.log(e);
    }
  };

  public requestEndorse = async ({
    tokenAddress,
    corners,
    seal,
    value,
    tokenID,
    sealID,
    onSuccess,
    setTonSurf,
  }: PropsRQ) => {
    if (!this.walletAddress) {
      message.error("There's not valid wallet address");
      return;
    }

    const blockchain = 'everscale';
    const type = 'permanent';

    const Endorsement: Endorsement = {
      blockchain,
      type,
      tokenID,
      sealID,
      ...corners,
      creator: this.walletAddress,
      value: convertFromExp(TonUtil.convertTonToNanoTon(value)) || '',
    };

    try {
      await this.endorseMutation.mutateAsync(Endorsement);

      if (this.tonClientBridge instanceof EverSurf) {
        setTonSurf({
          blockchain,
          type,
          tokenID,
          sealID,
          tokenAddress,
          creator: this.walletAddress,
          value: TonUtil.convertTonToNanoTon(value),
          corners,
          seal,
        });
        return;
      }

      await this.tonClientBridge.requestEndorse(
        tokenAddress,
        TonUtil.convertTonToNanoTon(value),
        seal,
        corners,
      );
      onSuccess();
    } catch (e) {
      message.error('Endorsement creation error');
      console.log(e);
    }
  };

  public acceptEndorse = async ({ tokenAddress, corner, seal, onSuccess, setTonSurf }: PropsAC) => {
    if (!this.walletAddress) {
      message.error("There's not valid wallet address");
      return;
    }

    try {
      if (this.tonClientBridge instanceof EverSurf) {
        setTonSurf({
          sealAddress: seal,
          stamp: tokenAddress,
          place: corner,
        });
        onSuccess(tokenAddress);
        return;
      }

      await this.tonClientBridge.acceptEndorse(seal, tokenAddress, corner);
      onSuccess(tokenAddress);
    } catch (e) {
      message.error('Endorsement creation error');
      console.log(e);
    }
  };

  public cancelEndorse = async ({ tokenAddress, stampID, onSuccess, setTonSurf }: PropsCL) => {
    if (!this.walletAddress) {
      message.error("There's not valid wallet address");
      return;
    }

    try {
      if (this.tonClientBridge instanceof EverSurf) {
        setTonSurf({
          tokenAddress,
          stampID,
        });
        onSuccess();
        return;
      }

      await this.tonClientBridge.cancelEndorse(tokenAddress);
      onSuccess();
    } catch (e) {
      message.error('Endorsement creation error');
      console.log(e);
    }
  };
}

export const initialSetUpAskFromValue = {
  endTime: 0,
  price: 0,
};

type PropsRQ = {
  tokenAddress: string;
  value: number;
  seal: string;
  tokenID: string;
  sealID: string;
  corners: {
    cornerSW: boolean;
    cornerSE: boolean;
    cornerNW: boolean;
    cornerNE: boolean;
  };
  onSuccess: () => void;
  setTonSurf: (v: Record<any, any>) => void;
};

type PropsAC = {
  tokenAddress: string;
  seal: string;
  corner: number;
  onSuccess: (address: string) => void;
  setTonSurf: (v: Record<any, any>) => void;
};

type PropsFA = {
  stampAddress: string;
  foreverAddress: string;
  stampID: string;
  foreverID: string;
  onSuccess: (address: string) => void;
  setTonSurf: (v: Record<any, any>) => void;
};

type PropsCL = {
  tokenAddress: string;
  onSuccess: () => void;
  stampID: string;
  setTonSurf: (v: Record<any, any>) => void;
};

