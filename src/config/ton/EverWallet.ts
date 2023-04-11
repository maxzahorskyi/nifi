import { Abi, DecodedMessageBody, ResultOfEncodeMessage, ResultOfRunTvm } from '@eversdk/core';
import HashUtil from '../../utils/HashUtil';
import FeeUtil from '../../utils/FeeUtil';
import { CommissionTypes } from '../../types/CommissionTypes';
import getConfig from 'next/config';
import CollectionRootAbi from './CollectionRoot.abi.json';
import CollectionAbi from './Collection.abi.json';
import { TokenType } from '../../features/Token/TokenService';
import { cornersMap } from '../../types/Tokens/Abis';
import AbiFinder from '../../abis/abi-finder';
import Wallet, { CreateTokenResult } from './Wallet';
import { ProviderRpcClient } from 'everscale-inpage-provider';

const config = getConfig().publicRuntimeConfig.ton;

const COL_ROOT_ADDR: string = config.contractAddress.colRoot;

class EverWallet extends Wallet {
  public async getEverWalletTransaction(
    recipient: string,
    price: any,
    payload: any,
  ): Promise<string> {
    const { transaction } = await this.ton.rawApi.sendMessage({
      sender: this.wallet.address,
      recipient,
      amount: price.toString(),
      bounce: true,
      payload,
    });

    return transaction.id.hash;
  }

  public isAuthSupported(): boolean {
    return true;
  }

  public async getAuthSignature(): Promise<string> {
    const ever = this.ton as ProviderRpcClient;
    const { publicKey } = await this.getInitializedWallet();

    const result = await ever.signDataRaw({
      publicKey,
      data: btoa('AUTHAUTHAUTHAUTHAUTHAUTHAUTHAUTH'),
    });

    return result.signatureHex;
  }

  public async getInitializedWallet(): Promise<any> {
    await this.initEverWallet();
    const wallet = await this.getWallet();

    return wallet;
  }

  public async addStamp(stampAddress: string, foreverAddress: string) {
    const commission = await this.getCommissions(CommissionTypes.StampAdd);

    return await this.getEverWalletTransaction(stampAddress, commission, {
      abi: JSON.stringify((await AbiFinder.findAbi(stampAddress)).value),
      method: 'setForever',
      params: {
        forever: foreverAddress,
      },
    });
  }

  public async acceptEndorse(sealAddress: string, stamp: string, place: number): Promise<string> {
    const commission = await this.getCommissions(CommissionTypes.EndorsementAccept);
    return await this.getEverWalletTransaction(sealAddress, commission, {
      abi: JSON.stringify((await AbiFinder.findAbi(sealAddress)).value),
      method: 'endorse',
      params: {
        stamp,
        place,
      },
    });
  }

  public async cancelEndorse(stampAddress: string): Promise<string> {
    const commission = await this.getCommissions(CommissionTypes.EndorsementCancel);
    return await this.getEverWalletTransaction(stampAddress, commission, {
      abi: JSON.stringify((await AbiFinder.findAbi(stampAddress)).value),
      method: 'cancelEndorse',
      params: {},
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
    return await this.getEverWalletTransaction(tokenAddress, commission + value, {
      abi: JSON.stringify((await AbiFinder.findAbi(tokenAddress)).value),
      method: 'requestEndorse',
      params: {
        seal,
        places,
        price: value,
      },
    });
  }

  public async acceptAsk(askAddress: string, price: number) {
    const commission = await this.getCommissions(CommissionTypes.AskAccept);
    return await this.getEverWalletTransaction(askAddress, commission + price, {
      abi: JSON.stringify((await AbiFinder.findAbi(askAddress)).value),
      method: 'acceptAsk',
      params: {},
    });
  }

  public async changeAsk(price: number, askAddress: string) {
    const commission = await this.getCommissions(CommissionTypes.AskPriceChange);
    return await this.getEverWalletTransaction(askAddress, commission + price, {
      abi: JSON.stringify((await AbiFinder.findAbi(askAddress)).value),
      method: 'changePrice',
      params: { newPrice: price },
    });
  }

  public async cancelAsk(askAddress: string) {
    const commission = await this.getCommissions(CommissionTypes.AskCancel);
    return await this.getEverWalletTransaction(askAddress, commission, {
      abi: JSON.stringify((await AbiFinder.findAbi(askAddress)).value),
      method: 'cancel',
      params: {},
    });
  }

  //vdvdv
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

      const root = await AbiFinder.findRoot('ask');
      const abiFile = root.abiFile as Abi;

      const transactionId: string = await this.getEverWalletTransaction(
        root.rootAddress,
        askCreationCommission,
        {
          abi: JSON.stringify(abiFile.value),
          method: 'create',
          params: {
            token,
            price,
            endTime,
            showcasePercent: showcaseFee,
          },
        },
      );

      address = await this.waitingTransactionsAddress(transactionId);
    }

    // Read boc //
    const boc: string = await this.getBoc(address);

    const result: DecodedMessageBody = await this.getDecodedMessage(address, 'ask', boc, 'trx');

    // set lockManager //
    const askManagementCommission = await this.getCommissions(CommissionTypes.AskManagement);

    await this.ton.rawApi.sendMessage({
      sender: this.wallet.address,
      recipient: token,
      amount: askManagementCommission.toString(),
      bounce: true,
      payload: {
        abi: JSON.stringify((await AbiFinder.findAbi(token)).value),
        method: 'lockManager',
        params: {
          manager: address,
          unlockTime: endTime + 432000,
        },
      },
    });

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
    const commission = await this.getCommissions(CommissionTypes.TokenCreation);

    const root = await AbiFinder.findRoot(type);
    const abiFile = root.abiFile as Abi;

    const transactionId: string = await this.getEverWalletTransaction(
      root.rootAddress,
      commission,
      {
        abi: JSON.stringify(abiFile.value),
        method: 'create',
        params: {
          creatorPercent: creatorFee,
          hash,
        },
      },
    );

    const address: string = await this.waitingTransactionsAddress(transactionId);

    // Read boc //
    const boc: string = await this.getBoc(address);

    // Run //
    const result: DecodedMessageBody = await this.getDecodedMessage(address, type, boc, 'token');

    return {
      id: result.value.id,
      address,
      parentAddress: root.rootAddress,
    };
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

    const transactionId: string = await this.getEverWalletTransaction(COL_ROOT_ADDR, commission, {
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
        level1: images[0],
        level2: images[1],
        level3: images[2],
        level4: images[3],
        level5: images[4],
        startTime,
      },
    });

    let address: string = await this.waitingTransactionsAddress(transactionId);

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

  public async createArt2Serie(
    dirtyHash: string,
    limit: number,
    dirtyCreatorFee: number,
  ): Promise<CreateTokenResult> {
    const hash = HashUtil.addPrefix(dirtyHash);
    const creatorFees = FeeUtil.toBlockchainFormat(dirtyCreatorFee);
    const commission = await this.getCommissions(CommissionTypes.TokenCreation);

    const root = await AbiFinder.findRoot('art2');
    const abiFile = root.abiFile as Abi;

    const transactionId: string = await this.getEverWalletTransaction(
      root.rootAddress,
      commission,
      {
        abi: JSON.stringify(abiFile.value),
        method: 'createSerie',
        params: {
          limit,
          hash,
          creatorPercent: creatorFees,
        },
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

  public async createArt2Token(serieAddress: string): Promise<CreateTokenResult> {
    const commission = await this.getCommissions(CommissionTypes.TokenMint);

    const series = await AbiFinder.findFullAbi(serieAddress);
    const abiFile = series.abiFile as Abi;

    const transactionId: string = await this.getEverWalletTransaction(serieAddress, commission, {
      abi: JSON.stringify(abiFile.value),
      method: 'create',
      params: {},
    });

    const address: string = await this.waitingTransactionsAddress(transactionId);

    // Read boc //
    const boc: string = await this.getBoc(address);

    const tokenAbi = await AbiFinder.findAbiBySupertypeAndLevel(series.supertype, 'token');

    // Run //
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

  //vdvdv

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

      const abiFile = root.abiFile as Abi;

      const transactionId: string = await this.getEverWalletTransaction(
        root.rootAddress,
        auctionCreationCommission,
        {
          abi: JSON.stringify(abiFile.value),
          method: 'create',
          params: {
            token: artToken,
            startBid,
            bidStep: stepBid,
            startTime,
            endTime,
            showcasePercent: showcaseFees,
          },
        },
      );

      address = await this.waitingTransactionsAddress(transactionId);
    }

    // Read boc //
    const boc: string = await this.getBoc(address);

    // Run //
    const result: DecodedMessageBody = await this.getDecodedMessage(address, 'auc', boc, 'trx');

    // set lockManager //
    const auctionManagementCommission = await this.getCommissions(
      CommissionTypes.AuctionManagement,
    );

    await this.ton.rawApi.sendMessage({
      sender: this.wallet.address,
      recipient: artToken,
      amount: auctionManagementCommission.toString(),
      bounce: true,
      payload: {
        abi: JSON.stringify((await AbiFinder.findAbi(artToken)).value),
        method: 'lockManager',
        params: {
          manager: address,
          unlockTime: endTime + 432000,
        },
      },
    });

    return {
      id: result.value.id,
      address,
      parentAddress: root.rootAddress,
    };
  }

  public async makeBidAuction(auctionAddr: string, bid: number): Promise<string> {
    const bidCreationCommission = await this.getCommissions(CommissionTypes.AuctionBidCreation);
    return await this.getEverWalletTransaction(auctionAddr, bid + bidCreationCommission, {
      abi: JSON.stringify((await AbiFinder.findAbi(auctionAddr)).value),
      method: 'bid',
      params: { price: bid },
    });
  }

  public async createBid(
    artToken: string,
    price: number,
    endTime: number,
  ): Promise<CreateTokenResult> {
    const bidCreationCommission = await this.getCommissions(CommissionTypes.BidCreation);

    const root = await AbiFinder.findRoot('bid');
    const abiFile = root.abiFile as Abi;

    const transactionId: string = await this.getEverWalletTransaction(
      root.rootAddress,
      price + bidCreationCommission,
      {
        abi: JSON.stringify(abiFile.value),
        method: 'create',
        params: {
          token: artToken,
          price,
          endTime,
        },
      },
    );

    const address: string = await this.waitingTransactionsAddress(transactionId);
    // Read boc //
    const boc: string = await this.getBoc(address);

    // Decode result //
    const result: DecodedMessageBody = await this.getDecodedMessage(address, 'bid', boc, 'trx');

    return {
      id: result.value.id,
      address,
      parentAddress: root.rootAddress,
    };
  }

  public async acceptBid(bidAddr: string, proceedAddress?: string): Promise<string> {
    let bidAbi: any;
    // Read boc //
    if (proceedAddress) {
      bidAbi = await AbiFinder.findAbi(proceedAddress);
      const bidAcceptCommission = await this.getCommissions(CommissionTypes.BidAccept);
      return await this.getEverWalletTransaction(proceedAddress, bidAcceptCommission, {
        abi: JSON.stringify(bidAbi.value),
        method: 'acceptBid',
        params: {},
      });
    }
    bidAbi = await AbiFinder.findAbi(bidAddr);

    const boc: string = await this.getBoc(bidAddr);

    // Decode result //
    const geter: DecodedMessageBody = await this.getDecodedMessage(
      bidAddr,
      'bid',
      boc,
      'trx',
      bidAbi,
    );

    // set lockManager //
    const auctionManagementCommission = await this.getCommissions(
      CommissionTypes.AuctionManagement,
    );

    const tokenAbi = await AbiFinder.findAbi(geter.value.token);

    await this.ton.rawApi.sendMessage({
      sender: this.wallet.address,
      recipient: geter.value.token,
      amount: auctionManagementCommission.toString(),
      bounce: true,
      payload: {
        abi: JSON.stringify(tokenAbi.value),
        method: 'lockManager',
        params: {
          manager: bidAddr,
          unlockTime: +geter.value.endTime + 7200,
        },
      },
    });
    // accept bid    //
    const bidAcceptCommission = await this.getCommissions(CommissionTypes.BidAccept);
    return await this.getEverWalletTransaction(bidAddr, bidAcceptCommission, {
      abi: JSON.stringify(bidAbi.value),
      method: 'acceptBid',
      params: {},
    });
  }

  public async changeOwnerArt2Token(art2TokenAddr: string, newOwner: string): Promise<string> {
    const tokenSendCommission = await this.getCommissions(CommissionTypes.TokenSend);
    return await this.getEverWalletTransaction(art2TokenAddr, tokenSendCommission, {
      abi: JSON.stringify((await AbiFinder.findAbi(art2TokenAddr)).value),
      method: 'changeOwner',
      params: { owner: newOwner },
    });
  }

  public async changeOwnerArtToken(artTokenAddr: string, newOwner: string): Promise<string> {
    const tokenSendCommission = await this.getCommissions(CommissionTypes.TokenSend);
    return await this.getEverWalletTransaction(artTokenAddr, tokenSendCommission, {
      abi: JSON.stringify((await AbiFinder.findAbi(artTokenAddr)).value),
      method: 'changeOwner',
      params: { owner: newOwner },
    });
  }

  public onWalletChange() {
    this.ton.raw?.on('networkChanged', (data: any) => {
      const network = JSON.parse(localStorage.getItem('network') || '{}');
      localStorage.setItem(
        'network',
        JSON.stringify({ ...network, EW: data?.selectedConnection || '' }),
      );
    });
    this.ton.raw?.on('permissionsChanged', async (data: any) => {
      const permissionsAddress = data?.permissions?.accountInteraction?.address;
      const walletAddress = this.wallet?.address;

      if (permissionsAddress && walletAddress && permissionsAddress !== walletAddress) {
        //window.location.reload()
      }
    });
    this.loggedOutAndDisconnect();
  }
}

export default EverWallet;
