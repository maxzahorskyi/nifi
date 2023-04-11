import {
  Abi,
  DecodedMessageBody,
  ResultOfEncodeMessage,
  ResultOfQueryCollection,
  ResultOfRunTvm,
  TonClient,
} from '@eversdk/core';
import HashUtil from '../../utils/HashUtil';
import FeeUtil from '../../utils/FeeUtil';
import { CommissionTypes } from '../../types/CommissionTypes';
import CommissionUtil from '../../utils/CommissionUtil';
import getConfig from 'next/config';
import SurfAuthAbi from './SurfAuth.abi.json';
import CollectionRootAbi from './CollectionRoot.abi.json';
import CollectionAbi from './Collection.abi.json';
import { libWeb, libWebSetup } from '../../../public/libs/eversdk-web';
import { TokenType } from '../../features/Token/TokenService';
import { cornersMap } from '../../types/Tokens/Abis';
import AbiFinder from '../../abis/abi-finder';
import Wallet, { CreateTokenResult } from './Wallet';
import { TokenValue } from 'everscale-inpage-provider';

const config = getConfig().publicRuntimeConfig.ton;

const SESSION_ROOT_CONTRACT: string = config.contractAddress.sessionRoot;
const COL_ROOT_ADDR: string = config.contractAddress.colRoot;

class EverSurf extends Wallet {
  public isAuthSupported(): boolean {
    return false;
  }

  public async getAuthSignature(): Promise<string> {
    throw new Error('Not supported');
  }

  public async getInitializedWallet(): Promise<any> {
    throw new Error('Not supported');
  }

  public async getMessage(returnUrl: string) {
    if (!returnUrl.startsWith('http')) {
      // TODO: uncomment this
      // throw new Error('Invalid returnUrl');
    }

    return await this.invoke('getAuthMsg', { returnUrl });
  }

  private async invoke(functionName: string, input: unknown) {
    await this.whenInitialized;
    const bocResult = await this.getBocSurf(SESSION_ROOT_CONTRACT);

    if (!bocResult.is_success && typeof bocResult.data === 'string') {
      return bocResult;
    }

    let result: ResultOfRunTvm;

    try {
      const encodedMessage = await this.client.abi.encode_message({
        abi: {
          type: 'Contract',
          value: SurfAuthAbi,
        },
        signer: {
          type: 'None',
        },
        call_set: {
          function_name: functionName,
          input,
        },
        address: SESSION_ROOT_CONTRACT,
      });

      result = await this.client.tvm.run_tvm({
        message: encodedMessage.message,
        // @ts-ignore
        account: bocResult.data.boc as string,
      });
    } catch (err: any) {
      return {
        is_success: false,
        error: {
          code: -1,
          message: err.message,
        },
      };
    }

    const rawMessage = result.out_messages[0];
    if (!rawMessage) {
      return {
        is_success: false,
        error: {
          code: -1,
          message: 'Response does not contain messages',
        },
      };
    }

    const decoded = await this.client.abi.decode_message({
      abi: {
        type: 'Contract',
        value: SurfAuthAbi,
      },
      message: rawMessage,
    });

    if (!decoded.value) {
      return {
        is_success: false,
        error: {
          code: -1,
          message: 'Response does not contain useful data',
        },
      };
    }

    return {
      is_success: true,
      data: decoded.value,
    };
  }

  private async getBocSurf(address: string) {
    let result: unknown[];

    try {
      const queryCollectionResult = await this.client.net.query_collection({
        collection: 'accounts',
        filter: {
          id: { eq: address },
        },
        result: 'boc',
      });

      result = queryCollectionResult.result;
    } catch (err: any) {
      return {
        is_success: false,
        error: {
          code: -1,
          message: err.message,
        },
      };
    }

    if (!result[0]) {
      return {
        is_success: false,
        error: {
          code: -1,
          message: 'TON SDK returned empty response on BOC request',
        },
      };
    }

    return {
      is_success: true,
      data: result[0] || '',
    };
  }

  public init(walletAddress?: string) {
    libWebSetup({
      // eslint-disable-next-line no-restricted-globals
      binaryURL: `${location.origin}/libs/eversdk-web/eversdk.wasm`,
    });

    // @ts-ignore
    TonClient.useBinaryLibrary(libWeb);

    if (!walletAddress) {
      if (this.onInitialize) {
        this.onInitialize();
      }
      return;
    }

    this.wallet = walletAddress;

    if (this.onInitialize) {
      this.onInitialize();
    }
  }

  public setWallet(walletAddress?: string) {
    this.wallet = walletAddress;
  }

  public async acceptAsk(askAddress: string, price: number) {
    const commission = await this.getCommissions(CommissionTypes.AskAccept);

    const payload = await this.getPayload(await AbiFinder.findAbi(askAddress), 'acceptAsk', {});

    return await this.invoke('getPayMsg', {
      sender: this.wallet,
      recipient: askAddress,
      amount: commission + price,
      payload,
    });
  }

  public async changeAsk(price: number, askAddress: string) {
    const commission = await this.getCommissions(CommissionTypes.AskPriceChange);

    const payload = await this.getPayload(await AbiFinder.findAbi(askAddress), 'changePrice', {
      newPrice: price,
    });

    return await this.invoke('getPayMsg', {
      sender: this.wallet,
      recipient: askAddress,
      amount: commission,
      payload,
    });
  }

  public async addStamp(stampAddress: string, foreverAddress: string) {
    const commission = await this.getCommissions(CommissionTypes.StampAdd);

    const payload = await this.getPayload(await AbiFinder.findAbi(stampAddress), 'setForever', {
      forever: foreverAddress,
    });

    return await this.invoke('getPayMsg', {
      sender: this.wallet,
      recipient: stampAddress,
      amount: commission,
      payload,
    });
  }

  public async cancelAsk(askAddress: string) {
    const commission = await this.getCommissions(CommissionTypes.AskCancel);

    const payload = await this.getPayload(await AbiFinder.findAbi(askAddress), 'cancel', {});

    return await this.invoke('getPayMsg', {
      sender: this.wallet,
      recipient: askAddress,
      amount: commission,
      payload,
    });
  }

  public async createAsk(
    creator: string,
    token: string,
    price: number,
    endTime: number,
    showcaseFee: number,
  ) {
    const commission = await this.getCommissions(CommissionTypes.AskCreation);

    const root = await AbiFinder.findRoot('ask');
    const abiFile = root.abiFile as Abi;

    const payload = await this.getPayload(abiFile, 'create', {
      token,
      price,
      endTime,
      showcasePercent: showcaseFee,
    });

    return await this.invoke('getPayMsg', {
      sender: this.wallet,
      recipient: root.rootAddress,
      amount: commission,
      payload,
    });
  }

  public async askManagement(artToken: string, askAddress: string, endTime: number) {
    const commission = await this.getCommissions(CommissionTypes.AskManagement);

    const tokenAbi = await AbiFinder.findAbi(artToken);

    const payload = await this.getPayload(tokenAbi, 'lockManager', {
      manager: askAddress,
      unlockTime: endTime + 432000,
    });

    return await this.invoke('getPayMsg', {
      sender: this.wallet,
      recipient: artToken,
      amount: commission,
      payload,
    });
  }

  public async createToken(dirtyHash: string, dirtyCreatorFee: number, type: TokenType) {
    const hash = HashUtil.addPrefix(dirtyHash);
    const creatorFee = FeeUtil.toBlockchainFormat(dirtyCreatorFee);
    const commission = await this.getCommissions(CommissionTypes.TokenCreation);

    const root = await AbiFinder.findRoot(type);
    const abiFile = root.abiFile as Abi;

    const payload = await this.getPayload(abiFile, 'create', {
      creatorPercent: creatorFee,
      hash,
    });

    return await this.invoke('getPayMsg', {
      sender: this.wallet,
      recipient: root.rootAddress,
      amount: commission,
      payload,
    });
  }

  public async mintCollectible(colAddress: string, mintCost: number) {
    const { transaction } = await this.ton.rawApi.sendMessage({
      sender: this.wallet.address,
      recipient: colAddress,
      amount: mintCost.toString(),
      bounce: true,
      payload: {
        abi: JSON.stringify(CollectionAbi),
        method: 'mintToken',
        params: {},
      },
    });

    return transaction;
  }

  public async createCollectibles(
    limit: number,
    images: Array<string[]>,
    name: string,
    symbol: string,
    creatorFees: number,
    mintCost: number,
    hash: string,
    startTime: number,
  ): Promise<CreateTokenResult> {
    const commission = await this.getCommissions(CommissionTypes.CollectibleCreation);

    const { transaction } = await this.ton.rawApi.sendMessage({
      sender: this.wallet.address,
      recipient: COL_ROOT_ADDR,
      amount: commission.toString(),
      bounce: true,
      payload: {
        abi: JSON.stringify(CollectionRootAbi),
        method: 'createCollection',
        params: {
          hash,
          limit,
          symbol,
          creatorPercent: creatorFees,
          creator: this.wallet.address,
          name,
          mintCost,
          level1: images[0] as TokenValue<string>,
          level2: images[1] as TokenValue<string>,
          level3: images[2] as TokenValue<string>,
          level4: images[3] as TokenValue<string>,
          level5: images[4] as TokenValue<string>,
          startTime,
        },
      },
    });

    const transactionId: string = transaction.id.hash;

    const address: string = await this.waitingTransactionsAddress(transactionId);
    // Read boc //

    const boc: string = await this.getBoc(address);

    // Run //
    const result: DecodedMessageBody = await this.getDecodedMessage(
      address,
      'collectible',
      boc,
      'root',
      {
        type: 'Contract',
        value: CollectionAbi,
      },
    );

    return {
      id: result.value.id,
      address,
      parentAddress: COL_ROOT_ADDR,
    };
  }

  public async createArt2Serie(dirtyHash: string, limit: number, dirtyCreatorFee: number) {
    const hash = HashUtil.addPrefix(dirtyHash);
    const creatorFees = FeeUtil.toBlockchainFormat(dirtyCreatorFee);
    const commission = await this.getCommissions(CommissionTypes.TokenCreation);

    const root = await AbiFinder.findRoot('art2');
    const abiFile = root.abiFile as Abi;

    const payload = await this.getPayload(abiFile, 'createSerie', {
      manager: this.wallet,
      limit,
      hash,
      creatorPercent: creatorFees,
    });

    return await this.invoke('getPayMsg', {
      sender: this.wallet,
      recipient: root.rootAddress,
      amount: commission,
      payload,
    });
  }

  public async createArt2Token(serieAddress: string) {
    const commission = await this.getCommissions(CommissionTypes.TokenMint);

    const series = await AbiFinder.findFullAbi(serieAddress);
    const abiFile = series.abiFile as Abi;

    const payload = await this.getPayload(abiFile, 'create', {});

    return await this.invoke('getPayMsg', {
      sender: this.wallet,
      recipient: serieAddress,
      amount: commission,
      payload,
    });
  }

  public async createAuction(
    artToken: string,
    startBid: number,
    stepBid: number,
    startTime: number,
    endTime: number,
    showcaseFees: number,
  ) {
    //artToken address
    //startBid - начальная минимальная ставка в нанотонах
    //stepBid - шаг ставки на сколько надо поднять ставку
    //Time in sec Math.round(new Date().getTime() / 1000)
    const auctionCreationCommission = await this.getCommissions(CommissionTypes.AuctionCreation);

    const root = await AbiFinder.findRoot('auc');
    const abiFile = root.abiFile as Abi;

    const payload = await this.getPayload(abiFile, 'create', {
      token: artToken,
      startBid,
      bidStep: stepBid,
      startTime,
      endTime,
      showcasePercent: showcaseFees,
    });

    return await this.invoke('getPayMsg', {
      sender: this.wallet,
      recipient: root.rootAddress,
      amount: auctionCreationCommission,
      payload,
    });
  }

  public async auctionManagement(artToken: string, auctionAddress: string, endTime: number) {
    const commission = await this.getCommissions(CommissionTypes.AuctionManagement);

    const payload = await this.getPayload(await AbiFinder.findAbi(artToken), 'lockManager', {
      manager: auctionAddress,
      unlockTime: endTime + 432000,
    });

    return await this.invoke('getPayMsg', {
      sender: this.wallet,
      recipient: artToken,
      amount: commission,
      payload,
    });
  }

  public async makeBidAuction(auctionAddr: string, bid: number) {
    const commission = await this.getCommissions(CommissionTypes.AuctionBidCreation);

    const payload = await this.getPayload(await AbiFinder.findAbi(auctionAddr), 'bid', {
      price: bid,
    });

    return await this.invoke('getPayMsg', {
      sender: this.wallet,
      recipient: auctionAddr,
      amount: bid + commission,
      payload,
    });
  }

  public async requestEndorse(tokenAddress: string, value: number, seal: string, corners: Corners) {
    const commission = await this.getCommissions(CommissionTypes.EndorsementRequest);

    let places: number = 0;
    Object.keys(corners).forEach((item) => {
      if (corners[item as keyof typeof corners]) {
        places += cornersMap[item as keyof typeof corners];
      }
    });

    const payload: string = await this.getPayload(
      await AbiFinder.findAbi(tokenAddress),
      'requestEndorse',
      {
        seal,
        places,
        price: value,
      },
    );

    return await this.invoke('getPayMsg', {
      sender: this.wallet,
      recipient: tokenAddress,
      amount: value + commission,
      payload,
    });
  }

  public async createBid(artToken: string, price: number, endTime: number) {
    const commission = await this.getCommissions(CommissionTypes.BidCreation);

    const root = await AbiFinder.findRoot('bid');
    const abiFile = root.abiFile as Abi;

    const payload = await this.getPayload(abiFile, 'create', {
      token: artToken,
      price,
      endTime,
    });

    return await this.invoke('getPayMsg', {
      sender: this.wallet,
      recipient: root.rootAddress,
      amount: commission + price,
      payload,
    });
  }

  public async acceptEndorse(sealAddress: string, stamp: string, place: number) {
    const commission = await this.getCommissions(CommissionTypes.EndorsementAccept);

    const payload = await this.getPayload(await AbiFinder.findAbi(sealAddress), 'endorse', {
      stamp,
      place,
    });

    return await this.invoke('getPayMsg', {
      sender: this.wallet,
      recipient: sealAddress,
      amount: commission,
      payload,
    });
  }

  public async cancelEndorse(stampAddress: string) {
    const commission = await this.getCommissions(CommissionTypes.EndorsementCancel);

    const payload = await this.getPayload(
      await AbiFinder.findAbi(stampAddress),
      'cancelEndorse',
      {},
    );

    return await this.invoke('getPayMsg', {
      sender: this.wallet,
      recipient: stampAddress,
      amount: commission,
      payload,
    });
  }

  public async acceptBid(bidAddr: string) {
    const commission = await this.getCommissions(CommissionTypes.BidAccept);

    const payload = await this.getPayload(await AbiFinder.findAbi(bidAddr), 'acceptBid', {});

    return await this.invoke('getPayMsg', {
      sender: this.wallet,
      recipient: bidAddr,
      amount: commission,
      payload,
    });
  }

  public async bidManagement(bidAddr: string, endTime: number, tokenAddress: string) {
    const commission = await this.getCommissions(CommissionTypes.BidManagement);

    const payload = await this.getPayload(await AbiFinder.findAbi(tokenAddress), 'lockManager', {
      manager: bidAddr,
      unlockTime: endTime + 7200,
    });

    return await this.invoke('getPayMsg', {
      sender: this.wallet,
      recipient: tokenAddress,
      amount: commission,
      payload,
    });
  }

  public async changeOwnerArtToken(artTokenAddr: string, newOwner: string) {
    const commission = await this.getCommissions(CommissionTypes.TokenSend);

    const payload = await this.getPayload(await AbiFinder.findAbi(artTokenAddr), 'changeOwner', {
      owner: newOwner,
    });

    return await this.invoke('getPayMsg', {
      sender: this.wallet,
      recipient: artTokenAddr,
      amount: commission,
      payload,
    });
  }

  public onWalletChange() {
    this.loggedOutAndDisconnect();
  }
}

export type Corners = {
  cornerSW: boolean;
  cornerSE: boolean;
  cornerNW: boolean;
  cornerNE: boolean;
};
export default EverSurf;

