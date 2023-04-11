import {
  Abi,
  DecodedMessageBody,
  ResultOfEncodeMessage,
  ResultOfRunTvm,
  TonClient,
} from '@eversdk/core';
import { libWeb, libWebSetup } from '../../../public/libs/eversdk-web';
import freeton, { ExtensionProvider } from 'freeton';
import CollectionRootAbi from './CollectionRoot.abi.json';
import CollectionAbi from './Collection.abi.json';
import HashUtil from '../../utils/HashUtil';
import FeeUtil from '../../utils/FeeUtil';
import Wallet, { CreateTokenResult } from './Wallet';
import { CommissionTypes } from '../../types/CommissionTypes';
import getConfig from 'next/config';
import { TokenType } from '../../features/Token/TokenService';
import { cornersMap } from '../../types/Tokens/Abis';
import AbiFinder from '../../abis/abi-finder';
import { RootContractType } from '../../abis/abis-storage/abis-root-contract-storage/abis-root-contract-storage';

const config = getConfig().publicRuntimeConfig.ton;

export const COL_ROOT_ADDR: string = config.contractAddress.colRoot;

class TonClientBridge extends Wallet {
  private provider: ExtensionProvider | undefined;
  public hasProvider = typeof window !== 'undefined' ? !!(window as any).freeton : false;

  public async init() {
    libWebSetup({
      // eslint-disable-next-line no-restricted-globals
      binaryURL: `${location.origin}/libs/eversdk-web/eversdk.wasm`,
    });

    const windowFreeTON: Object = (window as any).freeton;

    if (!windowFreeTON) {
      if (this.onInitialize) {
        this.onInitialize();
      }
      return;
    }

    this.provider = new freeton.providers.ExtensionProvider(windowFreeTON);

    // @ts-ignore
    TonClient.useBinaryLibrary(libWeb);

    const network = JSON.parse(localStorage.getItem('network') || '{}');
    try {
      const signer: any = await this.provider.getSigner();
      this.wallet = signer.getWallet();

      localStorage.setItem('network', JSON.stringify({ ...network, ET: signer.network.server }));
    } catch (e) {
      this.wallet = undefined;

      localStorage.setItem('network', JSON.stringify({ ...network, ET: '' }));
    }

    if (this.onInitialize) {
      this.onInitialize();
    }
  }

  public isAuthSupported(): boolean {
    return false;
  }

  public async getAuthSignature(): Promise<string> {
    throw new Error('Not supported');
  }

  public async getInitializedWallet(): Promise<any> {
    throw new Error('Not supported');
  }

  public async getExtratonTransactionId(
    address: string,
    commission: number,
    functionName: string,
    price?: number,
    input?: any,
  ) {
    const payload: string = await this.getPayload(
      await AbiFinder.findAbi(address),
      functionName,
      input ? input : {},
    );

    const contractMessageProcessing: any = await this.wallet.transfer(
      address,
      price ? commission + price : commission,
      true,
      payload,
    );
    await contractMessageProcessing.wait();

    const transactionId: string = contractMessageProcessing.txid;

    return transactionId;
  }

  public async getExtratonTransactionIdWithRoot(
    commission: number,
    functionName: string,
    rootName: RootContractType,
    price?: number,
    input?: any,
  ) {
    const root = await AbiFinder.findRoot(rootName);
    const abiFile = root.abiFile as Abi;

    const payload: string = await this.getPayload(abiFile, functionName, input ? input : {});

    const contractMessageProcessing: any = await this.wallet.transfer(
      root.rootAddress,
      price ? commission + price : commission,
      true,
      payload,
    );
    await contractMessageProcessing.wait();

    const transactionId: string = contractMessageProcessing.txid;

    return transactionId;
  }

  public async acceptAsk(askAddress: string, price: number) {
    const askAcceptCommission = await this.getCommissions(CommissionTypes.AskAccept);

    return await this.getExtratonTransactionId(askAddress, askAcceptCommission, 'acceptAsk', price);
  }

  public async changeAsk(price: number, askAddress: string) {
    const askChangeCommission = await this.getCommissions(CommissionTypes.AskPriceChange);

    return await this.getExtratonTransactionId(
      askAddress,
      askChangeCommission,
      'changePrice',
      price,
      { newPrice: price },
    );
  }

  public async cancelAsk(askAddress: string) {
    const askCancelCommission = await this.getCommissions(CommissionTypes.AskCancel);

    return await this.getExtratonTransactionId(askAddress, askCancelCommission, 'cancel');
  }

  public async addStamp(stampAddress: string, foreverAddress: string) {
    const commission = await this.getCommissions(CommissionTypes.StampAdd);

    return await this.getExtratonTransactionId(stampAddress, commission, 'setForever', 0, {
      forever: foreverAddress,
    });
  }

  public async requestEndorse(
    tokenAddress: string,
    value: number,
    seal: string,
    corners: {
      cornerSW: boolean;
      cornerSE: boolean;
      cornerNW: boolean;
      cornerNE: boolean;
    },
  ): Promise<string> {
    const commission = await this.getCommissions(CommissionTypes.EndorsementRequest);

    let places: number = 0;
    Object.keys(corners).forEach((item) => {
      if (corners[item as keyof typeof corners]) {
        places += cornersMap[item as keyof typeof corners];
      }
    });

    return await this.getExtratonTransactionId(tokenAddress, commission, 'requestEndorse', value, {
      seal,
      places,
      price: value,
    });
  }

  public async acceptEndorse(sealAddress: string, stamp: string, place: number): Promise<string> {
    const commission = await this.getCommissions(CommissionTypes.EndorsementAccept);

    return await this.getExtratonTransactionId(sealAddress, commission, 'endorse', 0, {
      stamp,
      place,
    });
  }

  public async cancelEndorse(tokenAddress: string): Promise<string> {
    const commission = await this.getCommissions(CommissionTypes.EndorsementCancel);

    return await this.getExtratonTransactionId(tokenAddress, commission, 'cancelEndorse');
  }

  public async makeBidAuction(auctionAddr: string, bid: number): Promise<string> {
    //bid ставка в нанотонах > curBid.value + stepBid + feeBid;
    // может быть вызвана если Math.round(new Date().getTime() / 1000) > starTime && < endTime;
    const bidCreationCommission = await this.getCommissions(CommissionTypes.AuctionBidCreation);

    return await this.getExtratonTransactionId(auctionAddr, bidCreationCommission, 'bid', bid, {
      price: bid,
    });
  }

  public async changeOwnerArt2Token(art2TokenAddr: string, newOwner: string): Promise<string> {
    const tokenSendCommission = await this.getCommissions(CommissionTypes.TokenSend);

    return await this.getExtratonTransactionId(
      art2TokenAddr,
      tokenSendCommission,
      'changeOwner',
      0,
      { owner: newOwner },
    );
  }

  public async changeOwnerArtToken(artTokenAddr: string, newOwner: string): Promise<string> {
    const tokenSendCommission = await this.getCommissions(CommissionTypes.TokenSend);

    return await this.getExtratonTransactionId(
      artTokenAddr,
      tokenSendCommission,
      'changeOwner',
      0,
      { owner: newOwner },
    );
  }
  // createAsk

  public async createAsk(
    creator: string,
    token: string,
    price: number,
    endTime: number,
    showcaseFee: number,
    askAddress?: string,
  ): Promise<{ id: string; address: string }> {
    // token - token address
    // creator - creator address
    // Time in sec Math.round(new Date().getTime() / 1000)
    let address: string;
    if (askAddress) {
      address = askAddress;
    } else {
      const askCreationCommission = await this.getCommissions(CommissionTypes.AskCreation);

      const transactionId: string = await this.getExtratonTransactionIdWithRoot(
        askCreationCommission,
        'create',
        'ask',
        0,
        {
          token,
          price,
          endTime,
          showcasePercent: showcaseFee,
        },
      );

      address = await this.waitingTransactionsAddress(transactionId);
    }

    // Read boc //
    const boc: string = await this.getBoc(address);
    const result: DecodedMessageBody = await this.getDecodedMessage(address, 'ask', boc, 'trx');

    // set lockManager //
    const payloadLockManager: string = await this.getPayload(
      await AbiFinder.findAbi(token),
      'lockManager',
      {
        manager: address,
        unlockTime: endTime + 432000,
      },
    );

    const askManagementCommission = await this.getCommissions(CommissionTypes.AskManagement);

    const contractMessageProcessing1: any = await this.wallet.transfer(
      token,
      askManagementCommission,
      true,
      payloadLockManager,
    );

    await contractMessageProcessing1.wait();

    return {
      id: result.value.id,
      address,
    };
  }

  public async createToken(
    dirtyHash: string,
    dirtyCreatorFee: number,
    type: TokenType,
  ): Promise<CreateTokenResult> {
    const hash = HashUtil.addPrefix(dirtyHash);
    const creatorFee = FeeUtil.toBlockchainFormat(dirtyCreatorFee);
    const root = await AbiFinder.findRoot(type);
    const commission = await this.getCommissions(CommissionTypes.TokenCreation);

    const transactionId: string = await this.getExtratonTransactionIdWithRoot(
      commission,
      'create',
      type,
      0,
      {
        creatorPercent: creatorFee,
        hash,
      },
    );

    const address: string = await this.waitingTransactionsAddress(transactionId);

    // Read boc //
    const boc: string = await this.getBoc(address);

    const result: DecodedMessageBody = await this.getDecodedMessage(address, type, boc, 'token');

    return {
      id: result.value.id,
      address,
      parentAddress: root.rootAddress,
    };
  }

  public async createArt2Serie(
    dirtyHash: string,
    limit: number,
    dirtyCreatorFee: number,
  ): Promise<CreateTokenResult> {
    const hash = HashUtil.addPrefix(dirtyHash);
    const creatorFees = FeeUtil.toBlockchainFormat(dirtyCreatorFee);
    const commission = await this.getCommissions(CommissionTypes.TokenCreation);
    const root = await AbiFinder.findRoot('art2');

    const transactionId: string = await this.getExtratonTransactionIdWithRoot(
      commission,
      'createSerie',
      'art2',
      0,
      {
        limit,
        hash,
        creatorPercent: creatorFees,
        manager: this.wallet.address,
      },
    );

    const address: string = await this.waitingTransactionsAddress(transactionId);

    // Read boc //

    const boc: string = await this.getBoc(address);

    const result: DecodedMessageBody = await this.getDecodedMessage(address, 'art2', boc, 'series');

    return {
      id: result.value.id,
      address,
      parentAddress: root.rootAddress,
    };
  }

  public async mintCollectible(colAddress: string, mintCost: number) {
    const payload: string = await this.getPayload(
      {
        type: 'Contract',
        value: CollectionAbi,
      },
      'mintToken',
      {},
    );

    const contractMessageProcessing: any = await this.wallet.transfer(
      colAddress,
      mintCost,
      true,
      payload,
    );

    await contractMessageProcessing.wait();
    const transactionId: string = contractMessageProcessing.txid;
    return transactionId;
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

    const payload: string = await this.getPayload(
      {
        type: 'Contract',
        value: CollectionRootAbi,
      },
      'createCollection',
      {
        creator: this.wallet.address,
        hash,
        name,
        symbol,
        limit,
        creatorPercent: creatorFees,
        mintCost,
        level1: images[0],
        level2: images[1],
        level3: images[2],
        level4: images[3],
        level5: images[4],
        startTime,
      },
    );

    const contractMessageProcessing: any = await this.wallet.transfer(
      COL_ROOT_ADDR,
      commission,
      true,
      payload,
    );

    await contractMessageProcessing.wait();
    const transactionId: string = contractMessageProcessing.txid;

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

  public async createArt2Token(serieAddress: string): Promise<CreateTokenResult> {
    const series = await AbiFinder.findFullAbi(serieAddress);
    const abiFile = series.abiFile as Abi;

    const payload: string = await this.getPayload(abiFile, 'create', {});

    const commission = await this.getCommissions(CommissionTypes.TokenMint);

    const contractMessageProcessing: any = await this.wallet.transfer(
      serieAddress,
      commission,
      true,
      payload,
    );
    await contractMessageProcessing.wait();
    const transactionId: string = contractMessageProcessing.txid;

    const address: string = await this.waitingTransactionsAddress(transactionId);

    // Read boc //
    const boc: string = await this.getBoc(address);

    const tokenAbi = await AbiFinder.findAbiBySupertypeAndLevel(series.supertype, 'token');

    const result: DecodedMessageBody = await this.getDecodedMessage(
      address,
      'art2',
      boc,
      'token',
      tokenAbi,
    );

    return {
      id: result.value.id,
      address,
      parentAddress: serieAddress,
    };
  }
  // createAuction

  public async createAuction(
    artToken: string,
    startBid: number,
    stepBid: number,
    startTime: number,
    endTime: number,
    showcaseFees: number,
    aucAddress?: string,
  ): Promise<CreateTokenResult> {
    //artToken address
    //startBid - начальная минимальная ставка в нанотонах
    //stepBid - шаг ставки на сколько надо поднять ставку
    //Time in sec Math.round(new Date().getTime() / 1000)
    const root = await AbiFinder.findRoot('auc');
    let address: string;
    if (aucAddress) {
      address = aucAddress;
    } else {
      const auctionCreationCommission = await this.getCommissions(CommissionTypes.AuctionCreation);

      const transactionId: string = await this.getExtratonTransactionIdWithRoot(
        auctionCreationCommission,
        'create',
        'auc',
        0,
        {
          token: artToken,
          startBid,
          bidStep: stepBid,
          startTime,
          endTime,
          showcasePercent: showcaseFees,
        },
      );

      address = await this.waitingTransactionsAddress(transactionId);
    }

    // Read boc //
    const boc: string = await this.getBoc(address);

    const result: DecodedMessageBody = await this.getDecodedMessage(address, 'auc', boc, 'trx');

    ///////////////////
    // set lockManager //
    ///////////////////

    const payloadLockManager: string = await this.getPayload(
      await AbiFinder.findAbi(artToken),
      'lockManager',
      {
        manager: address,
        unlockTime: endTime + 432000,
      },
    );

    const auctionManagementCommission = await this.getCommissions(
      CommissionTypes.AuctionManagement,
    );

    const contractMessageProcessing1: any = await this.wallet.transfer(
      artToken,
      auctionManagementCommission,
      true,
      payloadLockManager,
    );
    await contractMessageProcessing1.wait();

    return {
      id: result.value.id,
      address,
      parentAddress: root.rootAddress,
    };
  }

  public async createBid(
    artToken: string,
    price: number,
    endTime: number,
  ): Promise<CreateTokenResult> {
    //price in nanotons
    //Time in sec Math.round(new Date().getTime() / 1000)
    const root = await AbiFinder.findRoot('bid');

    const bidCreationCommission = await this.getCommissions(CommissionTypes.BidCreation);

    const transactionId: string = await this.getExtratonTransactionIdWithRoot(
      bidCreationCommission,
      'create',
      'bid',
      price,
      {
        token: artToken,
        price,
        endTime,
      },
    );

    const address: string = await this.waitingTransactionsAddress(transactionId);

    // Read boc //
    const boc: string = await this.getBoc(address);

    const result: DecodedMessageBody = await this.getDecodedMessage(address, 'bid', boc, 'trx');

    return {
      id: result.value.id,
      address,
      parentAddress: root.rootAddress,
    };
  }

  //
  public async acceptBid(bidAddr: string, proceedAddress?: string): Promise<string> {
    const bidAbi = await AbiFinder.findAbi(bidAddr);

    if (proceedAddress) {
      const bidAcceptCommission = await this.getCommissions(CommissionTypes.BidAccept);

      return await this.getExtratonTransactionId(proceedAddress, bidAcceptCommission, 'acceptBid');
    }

    // Read boc //
    const boc: string = await this.getBoc(bidAddr);

    const result: DecodedMessageBody = await this.getDecodedMessage(
      bidAddr,
      'bid',
      boc,
      'trx',
      bidAbi,
    );

    const tokenAbi = await AbiFinder.findAbi(result.value.token);

    const payloadLockManager: string = await this.getPayload(tokenAbi, 'lockManager', {
      manager: bidAddr,
      unlockTime: +result.value.endTime + 7200,
    });

    const auctionManagementCommission = await this.getCommissions(
      CommissionTypes.AuctionManagement,
    );

    const contractMessageProcessing1: any = await this.wallet.transfer(
      result.value.token,
      auctionManagementCommission,
      true,
      payloadLockManager,
    );
    await contractMessageProcessing1.wait();
    // accept bid    //
    const bidAcceptCommission = await this.getCommissions(CommissionTypes.BidAccept);

    return await this.getExtratonTransactionId(bidAddr, bidAcceptCommission, 'acceptBid');
  }

  public onWalletChange() {
    return this.provider?.addEventListener(async (event: ExtensionEvent) => {
      switch (event.name) {
        case 'changeWallet':
          {
            this.whenInitialized = new Promise((resolve) => {
              this.onInitialize = resolve;
            });
            const signer: any = await this.provider.getSigner();
            this.wallet = signer.getWallet();

            window.location.reload();

            if (this.onInitialize) {
              this.onInitialize();
            }
          }
          break;
        case 'changeNetwork':
          {
            const network = JSON.parse(localStorage.getItem('network') || '{}');
            try {
              const signer: any = await this.provider.getSigner();
              const wallet = signer.getWallet();

              localStorage.setItem(
                'network',
                JSON.stringify({ ...network, ET: wallet.signer.network.server }),
              );
            } catch (e) {
              localStorage.setItem('network', JSON.stringify({ ...network, ET: '' }));
            }
          }
          break;
        default:
          break;
      }
    });
  }
}

interface ExtensionEvent {
  name: 'changeNetwork' | 'changeWallet';
}

export default TonClientBridge;

