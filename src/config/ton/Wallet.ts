import {
  Abi,
  DecodedMessageBody,
  ResultOfEncodeMessage,
  ResultOfEncodeMessageBody,
  ResultOfQueryCollection,
  ResultOfRunTvm,
  TonClient,
} from '@eversdk/core';
import { Commission, CommissionTypes } from '../../types/CommissionTypes';
import CommissionUtil from '../../utils/CommissionUtil';
import getConfig from 'next/config';
import AbiFinder, { Level } from '../../abis/abi-finder';
import { ProviderRpcClient, WalletContractType } from 'everscale-inpage-provider';
import { RootContractType } from '../../abis/abis-storage/abis-root-contract-storage/abis-root-contract-storage';
import { libWeb, libWebSetup } from '../../../public/libs/eversdk-web';
import { mutexLockOrAwait, mutexUnlock } from '../../utils/mutex';

const config = getConfig().publicRuntimeConfig.ton;
const SERVER_ENDPOINTS: string[] = config.endpoints;

abstract class Wallet {
  public wallet: any;
  public onInitialize: Function | undefined;
  public client: TonClient;
  public readonly commissions: Commission[] | undefined;
  public whenInitialized = new Promise((resolve) => {
    this.onInitialize = resolve;
  });

  constructor(commissions: Commission[] | undefined) {
    this.client = new TonClient({
      network: {
        endpoints: SERVER_ENDPOINTS,
      },
    });

    this.commissions = commissions;
  }
  public ton = new ProviderRpcClient();

  public async refresh() {
    await this.ton?.disconnect();
    await this.initEverWallet();
  }

  public hasProviderEverWallet =
    typeof document !== 'undefined'
      ? require('everscale-inpage-provider').hasEverscaleProvider
      : undefined;

  public async initEverWallet() {
    const mutexName = 'init_ever_wallet';
    await mutexLockOrAwait(mutexName);

    try {
      await this.initEverWalletInternal();
    } finally {
      mutexUnlock(mutexName);
    }
  }

  private async initEverWalletInternal() {
    libWebSetup({
      // eslint-disable-next-line no-restricted-globals
      binaryURL: `${location.origin}/libs/eversdk-web/eversdk.wasm`,
    });

    // @ts-ignore
    TonClient.useBinaryLibrary(libWeb);

    try {
      if (!(await this.hasProviderEverWallet())) {
        if (this.onInitialize) {
          this.onInitialize();
        }
        return;
      }

      await this.ton.ensureInitialized();

      const permissions = await this.ton?.rawApi?.requestPermissions({
        permissions: ['basic', 'accountInteraction'],
      });
      if (permissions === undefined) return 'foo' as any;

      if (permissions?.accountInteraction == null) {
        throw new Error('Insufficient permissions');
      }
      this.wallet = permissions?.accountInteraction;

      this.ton?.getProviderState().then((data: any) => {
        const network = JSON.parse(localStorage.getItem('network') || '{}');
        localStorage.setItem(
          'network',
          JSON.stringify({ ...network, EW: data?.selectedConnection || '' }),
        );
      });
    } catch (e) {
      console.log(e);
      return;
    }
    if (this.onInitialize) {
      this.onInitialize();
    }
  }

  public abstract getInitializedWallet(): Promise<any>;

  public abstract isAuthSupported(): boolean;

  public abstract getAuthSignature(): Promise<string>;

  public getWallet() {
    return this.whenInitialized.then(() => this.wallet).catch(() => undefined);
  }

  public loggedOutAndDisconnect() {
    this.ton.raw?.on('loggedOut', async (data: any) => {
      this.whenInitialized = new Promise((resolve) => {
        this.onInitialize = resolve;
      });
      this.wallet = undefined;

      // window.location.reload()

      if (this.onInitialize) {
        this.onInitialize();
      }
    });
    this.ton.raw?.on('disconnected', async (data: any) => {
      this.whenInitialized = new Promise((resolve) => {
        this.onInitialize = resolve;
      });
      this.wallet = undefined;

      // window.location.reload()

      if (this.onInitialize) {
        this.onInitialize();
      }
    });
  }

  public async getCommissions(commissionTypes: CommissionTypes) {
    const commission =
      CommissionUtil.getValueById(this.commissions, commissionTypes, 'blockchain') || 0;

    if (!commission) {
      throw new Error('Commissions are not received');
    }

    return commission;
  }

  public async waitingTransactionsAddress(transactionId: string) {
    const waitingCollectionResult: any = await this.client.net.wait_for_collection({
      collection: 'transactions',
      filter: {
        id: {
          eq: transactionId,
        },
      },
      result: `out_messages {
        dst_transaction {
          out_messages {
            dst
          }
        }
      }`,
    });
    return waitingCollectionResult.result.out_messages[0].dst_transaction.out_messages[0].dst;
  }

  public async getBoc(address: string) {
    const queryCollectionResult: ResultOfQueryCollection =
      await this.client.net.wait_for_collection({
        collection: 'accounts',
        filter: {
          id: {
            eq: address,
          },
        },
        result: 'boc',
      });

    return queryCollectionResult.result.length
      ? queryCollectionResult.result[0].boc
      : // SDK problem https://t.me/ton_sdk/9155
        // @ts-ignore
        queryCollectionResult.result.boc;
  }

  public async getDecodedMessage(
    address: string,
    rootName: RootContractType,
    boc: any,
    level: Level,
    abiFile?: Abi,
  ) {
    const root = await AbiFinder.findRoot(rootName);

    const Abi = await AbiFinder.findAbiBySupertypeAndLevel(root.supertype, level);

    const encodedMessage: ResultOfEncodeMessage = await this.client.abi.encode_message({
      abi: abiFile ? abiFile : Abi,
      signer: {
        type: 'None',
      },
      call_set: {
        function_name: 'getInfo',
        input: {},
      },
      address,
    });

    const message: ResultOfRunTvm = await this.client.tvm.run_tvm({
      message: encodedMessage.message,
      account: boc,
    });

    const outMessages: string = message.out_messages[0] ?? '';

    const result: DecodedMessageBody = await this.client.abi.decode_message({
      abi: Abi,
      message: outMessages,
    });
    return result;
  }

  public async getPayload(abi: Abi, functionName: string, input: Object): Promise<string> {
    const result: ResultOfEncodeMessageBody = await this.client.abi.encode_message_body({
      abi,
      call_set: {
        function_name: functionName,
        input,
      },
      is_internal: true,
      signer: {
        type: 'None',
      },
    });
    return result.body;
  }
}

interface WalletTypes {
  address: string;
  publicKey: string;
  contractType: WalletContractType;
}
export interface CreateTokenResult {
  id: string;
  address: string;
  parentAddress: string;
}

export default Wallet;
