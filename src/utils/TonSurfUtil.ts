import useTonClientBridge from '../hooks/useTonClientBridge';
import EverSurf, { Corners } from '../config/ton/EverSurf';
import { getTime } from 'date-fns';
import crypto from 'crypto';
import generateHash from './generateHash';
import { TokenType } from '../features/Token/TokenService';

export enum TonSurfModalTypes {
  authorization = 'authorization',
  createToken = 'createToken',
  createSeries = 'createSeries',
  mintSeries = 'mintSeries',
  createAuction = 'createAuction',
  auctionManagement = 'auctionManagement',
  bidCreation = 'bidCreation',
  makeBidAuction = 'makeBidAuction',
  createAsk = 'createAsk',
  askManagement = 'askManagement',
  cancelAsk = 'cancelAsk',
  changeAsk = 'changeAsk',
  acceptAsk = 'acceptAsk',
  acceptBid = 'acceptBid',
  bidManagement = 'bidManagement',
  sendToken = 'sendToken',
  requestEndorse = 'requestEndorse',
  acceptEndorse = 'acceptEndorse',
  cancelEndorse = 'cancelEndorse',
  addToForever = 'addToForever',
  initialModal = 'initialModal',
}

export class TonSurfUtil {
  private ton = useTonClientBridge();
  private time = Math.round(new Date().getTime() / 1000);
  public [TonSurfModalTypes.authorization] = async (params: {
    hash: string;
  }): Promise<string | void> => {
    // Deprecated, TODO: remove this method
    if (this.ton instanceof EverSurf) {
      const res = await this.ton.getMessage(params.hash);
      return res.is_success ? (res.data as string) : undefined;
    }
    return;
  };

  public [TonSurfModalTypes.createToken] = async (
    params: {
      dirtyHash: string;
      dirtyCreatorFee: number;
      type: TokenType;
    },
    setCreatedTime: (time: number) => void,
  ): Promise<string | void> => {
    const { dirtyHash, dirtyCreatorFee, type } = params;
    if (this.ton instanceof EverSurf) {
      const res = await this.ton.createToken(dirtyHash, dirtyCreatorFee, type);
      setCreatedTime(this.time);
      return res.is_success ? (res.data as string) : undefined;
    }
    return;
  };

  public [TonSurfModalTypes.addToForever] = async (
    params: {
      stampAddress: string;
      foreverAddress: string;
    },
    setCreatedTime: (time: number) => void,
  ): Promise<string | void> => {
    const { stampAddress, foreverAddress } = params;
    if (this.ton instanceof EverSurf) {
      const res = await this.ton.addStamp(stampAddress, foreverAddress);
      setCreatedTime(this.time);
      return res.is_success ? (res.data as string) : undefined;
    }
    return;
  };

  public [TonSurfModalTypes.acceptEndorse] = async (
    params: {
      sealAddress: string;
      stamp: string;
      place: number;
    },
    setCreatedTime: (time: number) => void,
  ): Promise<string | void> => {
    const { sealAddress, stamp, place } = params;
    if (this.ton instanceof EverSurf) {
      const res = await this.ton.acceptEndorse(sealAddress, stamp, place);
      setCreatedTime(this.time);
      return res.is_success ? (res.data as string) : undefined;
    }
    return;
  };

  public [TonSurfModalTypes.cancelEndorse] = async (
    params: {
      tokenAddress: string;
    },
    setCreatedTime: (time: number) => void,
  ): Promise<string | void> => {
    const { tokenAddress } = params;
    if (this.ton instanceof EverSurf) {
      const res = await this.ton.cancelEndorse(tokenAddress);
      setCreatedTime(this.time);
      return res.is_success ? (res.data as string) : undefined;
    }
    return;
  };

  public [TonSurfModalTypes.requestEndorse] = async (
    params: {
      tokenAddress: string;
      value: number;
      seal: string;
      corners: Corners;
    },
    setCreatedTime: (time: number) => void,
  ): Promise<string | void> => {
    const { tokenAddress, value, seal, corners } = params;
    if (this.ton instanceof EverSurf) {
      const res = await this.ton.requestEndorse(tokenAddress, value, seal, corners);
      setCreatedTime(this.time);
      return res.is_success ? (res.data as string) : undefined;
    }
    return;
  };

  public [TonSurfModalTypes.createSeries] = async (
    params: {
      dirtyHash: string;
      dirtyCreatorFee: number;
      limit: number;
    },
    setCreatedTime: (time: number) => void,
  ): Promise<string | void> => {
    const { dirtyHash, dirtyCreatorFee, limit } = params;
    if (this.ton instanceof EverSurf) {
      const res = await this.ton.createArt2Serie(dirtyHash, limit, dirtyCreatorFee);
      setCreatedTime(this.time);
      return res.is_success ? (res.data as string) : undefined;
    }
    return;
  };

  public [TonSurfModalTypes.mintSeries] = async (
    params: {
      seriesAddress: string;
      supply: number;
      seriesId: string;
    },
    setCreatedParams: (params: Record<any, any>) => void,
  ): Promise<string | void> => {
    const { seriesAddress, seriesId, supply } = params;
    if (this.ton instanceof EverSurf) {
      const res = await this.ton.createArt2Token(seriesAddress);
      setCreatedParams({
        tokenID: `${seriesId}-${(supply + 1).toString()}`,
      });
      return res.is_success ? (res.data as string) : undefined;
    }
    return;
  };

  public [TonSurfModalTypes.createAuction] = async (
    params: {
      artToken: string;
      startBid: number;
      stepBid: number;
      startTime: number;
      endTime: number;
      showcaseFees: number;
      tokenID: string;
    },
    setCreatedParams: (params: Record<any, any>) => void,
  ): Promise<string | void> => {
    const { artToken, startBid, stepBid, startTime, endTime, showcaseFees, tokenID } = params;
    if (this.ton instanceof EverSurf) {
      const res = await this.ton.createAuction(
        artToken,
        startBid,
        stepBid,
        startTime,
        endTime,
        showcaseFees,
      );
      setCreatedParams({
        deployed: {
          tokenID,
          endTime,
          startTime,
          status: 'created',
        },
      });
      return res.is_success ? (res.data as string) : undefined;
    }
    return;
  };

  public [TonSurfModalTypes.auctionManagement] = async (
    params: {
      artToken: string;
      auctionAddress: string;
      endTime: number;
      tokenID: string;
      startTime: number;
    },
    setCreatedParams: (params: Record<any, any>) => void,
  ): Promise<string | void> => {
    const { artToken, auctionAddress, endTime, tokenID, startTime } = params;
    if (this.ton instanceof EverSurf) {
      const res = await this.ton.auctionManagement(artToken, auctionAddress, endTime);
      setCreatedParams({
        deployed: {
          tokenID,
          endTime,
          startTime,
          status: 'pending',
        },
      });
      return res.is_success ? (res.data as string) : undefined;
    }
    return;
  };

  public [TonSurfModalTypes.bidCreation] = async (
    params: {
      artToken: string;
      price: number;
      endTime: number;
    },
    setCreatedParams: (params: Record<any, any>) => void,
  ): Promise<string | void> => {
    const { artToken, price, endTime } = params;
    if (this.ton instanceof EverSurf) {
      const res = await this.ton.createBid(artToken, price, endTime);
      setCreatedParams({
        deployed: {
          tokenAddress: artToken,
          endTime,
          status: 'created',
        },
      });
      return res.is_success ? (res.data as string) : undefined;
    }
    return;
  };

  public [TonSurfModalTypes.makeBidAuction] = async (
    params: {
      auctionAddress: string;
      bid: number;
    },
    setCreatedParams: (params: Record<any, any>) => void,
  ): Promise<string | void> => {
    const { auctionAddress, bid } = params;
    if (this.ton instanceof EverSurf) {
      const res = await this.ton.makeBidAuction(auctionAddress, bid);
      setCreatedParams({
        deployed: {
          auctionAddress,
          value: bid,
          status: 'pending',
        },
      });
      return res.is_success ? (res.data as string) : undefined;
    }
    return;
  };

  public [TonSurfModalTypes.createAsk] = async (
    params: {
      creator: string;
      token: string;
      price: number;
      endTime: number;
      showcaseFee: number;
      tokenID: string;
    },
    setCreatedParams: (params: Record<any, any>) => void,
  ): Promise<string | void> => {
    const { creator, token, price, endTime, showcaseFee } = params;
    if (this.ton instanceof EverSurf) {
      const res = await this.ton.createAsk(creator, token, price, endTime, showcaseFee);
      setCreatedParams({
        deployed: {
          tokenAddress: token,
          endTime,
          status: 'created',
        },
      });
      return res.is_success ? (res.data as string) : undefined;
    }
    return;
  };

  public [TonSurfModalTypes.askManagement] = async (
    params: {
      token: string;
      askAddress: string;
      endTime: number;
      tokenID: string;
      startTime: number;
    },
    setCreatedParams: (params: Record<any, any>) => void,
  ): Promise<string | void> => {
    const { token, askAddress, endTime } = params;
    if (this.ton instanceof EverSurf) {
      const res = await this.ton.askManagement(token, askAddress, endTime);
      setCreatedParams({
        deployed: {
          tokenAddress: token,
          endTime,
          status: 'pending',
        },
      });
      return res.is_success ? (res.data as string) : undefined;
    }
    return;
  };

  public [TonSurfModalTypes.cancelAsk] = async (
    params: {
      askAddress: string;
    },
    setCreatedParams: (params: Record<any, any>) => void,
  ): Promise<string | void> => {
    const { askAddress } = params;
    if (this.ton instanceof EverSurf) {
      const res = await this.ton.cancelAsk(askAddress);
      setCreatedParams({
        deployed: {
          askAddress,
          status: 'cancelled',
        },
      });
      return res.is_success ? (res.data as string) : undefined;
    }
    return;
  };

  public [TonSurfModalTypes.changeAsk] = async (
    params: {
      askAddress: string;
      price: number;
    },
    setCreatedParams: (params: Record<any, any>) => void,
  ): Promise<string | void> => {
    const { askAddress, price } = params;
    if (this.ton instanceof EverSurf) {
      const res = await this.ton.changeAsk(price, askAddress);
      setCreatedParams({
        deployed: {
          askAddress,
          currentAskValue: price.toString(),
          status: 'pending',
        },
      });
      return res.is_success ? (res.data as string) : undefined;
    }
    return;
  };

  public [TonSurfModalTypes.acceptAsk] = async (
    params: {
      askAddress: string;
      price: number;
    },
    setCreatedParams: (params: Record<any, any>) => void,
  ): Promise<string | void> => {
    const { askAddress, price } = params;
    if (this.ton instanceof EverSurf) {
      const res = await this.ton.acceptAsk(askAddress, price);
      setCreatedParams({
        deployed: {
          askAddress,
          status: 'executed',
        },
      });
      return res.is_success ? (res.data as string) : undefined;
    }
    return;
  };

  public [TonSurfModalTypes.acceptBid] = async (
    params: {
      bidAddress: string;
    },
    setCreatedParams: (params: Record<any, any>) => void,
  ): Promise<string | void> => {
    const { bidAddress } = params;
    if (this.ton instanceof EverSurf) {
      const res = await this.ton.acceptBid(bidAddress);
      setCreatedParams({
        deployed: {
          bidAddress,
          status: 'accepted',
        },
      });
      return res.is_success ? (res.data as string) : undefined;
    }
    return;
  };

  public [TonSurfModalTypes.bidManagement] = async (params: {
    bidAddress: string;
    endTime: number;
    tokenAddress: string;
  }): Promise<string | void> => {
    const { bidAddress, endTime, tokenAddress } = params;
    if (this.ton instanceof EverSurf) {
      const res = await this.ton.bidManagement(bidAddress, endTime, tokenAddress);
      return res.is_success ? (res.data as string) : undefined;
    }
    return;
  };

  public [TonSurfModalTypes.sendToken] = async (
    params: {
      artTokenAddr: string;
      newOwner: string;
    },
    setCreatedParams: (params: Record<any, any>) => void,
  ): Promise<string | void> => {
    const { artTokenAddr, newOwner } = params;
    if (this.ton instanceof EverSurf) {
      const res = await this.ton.changeOwnerArtToken(artTokenAddr, newOwner);
      setCreatedParams({
        deployed: {
          address: artTokenAddr,
          owner: newOwner,
        },
      });
      return res.is_success ? (res.data as string) : undefined;
    }
    return;
  };

  public static getHashes = () => {
    const today = Math.round(getTime(new Date()) / 1000);
    const randomBytesBlockchain = crypto.randomBytes(20).toString();
    const randomBytesSecret = crypto.randomBytes(20).toString();
    const confirmationHash = generateHash(randomBytesBlockchain + today.toString(), 'base64');
    const cookiesHash = generateHash(randomBytesSecret + today.toString(), 'hex');

    return {
      confirmationHash,
      cookiesHash,
      today,
    };
  };
}
