import { IAbisDynamicContractsStorage } from './abis-storage/abis-dynamic-contracts-storage/abis-dynamic-contracts-storage';

import {
  IAbisRootContractStorage,
  RootContractAbiEntry,
  RootContractType,
} from './abis-storage/abis-root-contract-storage/abis-root-contract-storage';

import { Abi } from '@eversdk/core';
import { mutexLockOrAwait, mutexUnlock } from '../utils/mutex';
import { IAbisFetcher } from './abis-fetcher/abis-fetcher';
import { IAbisContractTypesStorage } from './abis-storage/abis-contract-types-storage/abis-contract-types-storage';
import assert from '../utils/assert';
import RealmUtil from '../utils/RealmUtil';
import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client';
import AbisRootContractStorageGql from './abis-storage/abis-root-contract-storage/abis-root-contract-storage-gql';
import AbisContractTypesStorageGql from './abis-storage/abis-contract-types-storage/abis-contract-types-storage-gql';
import { AbisDynamicContractsStorageGql } from './abis-storage/abis-dynamic-contracts-storage/abis-dynamic-contracts-storage-gql';
import AbisFetcherHttp, { AbiBSC } from './abis-fetcher/abis-fetcher-http';
import getConfig from 'next/config';
import * as Realm from 'realm-web';
import { AbiItem } from 'web3-utils';

const config = getConfig().publicRuntimeConfig;

const REALM_APP_ID = config.services.realmAppId;
const REALM_APP_API_KEY = config.services.realmAppApiKey;

export type FindAbiResult = {
  readonly rootAddress: string;
  readonly abiFile: Abi;
  readonly supertype: string;
  readonly longtype: string;
};

export type FindBNBAbiResult = {
  readonly rootAddress: string;
  readonly abiFile: AbiBSC;
  readonly supertype: string;
  readonly longtype: string;
};

export type Level = 'root' | 'series' | 'token' | 'trx';

export default class AbiFinder {
  private static instance: AbiFinder | null = null;

  private constructor(
    private readonly rootContractStorage: IAbisRootContractStorage,
    private readonly contractTypesStorage: IAbisContractTypesStorage,
    private readonly dynamicContractsStorage: IAbisDynamicContractsStorage,
    private readonly abisFetcher: IAbisFetcher,
  ) {
    /* */
  }

  private static async getInstance(): Promise<AbiFinder> {
    const mutexName = 'getting_abi_finder';
    await mutexLockOrAwait(mutexName);

    try {
      return await this.getInstanceInternal();
    } finally {
      mutexUnlock(mutexName);
    }
  }

  private static async getInstanceInternal(): Promise<AbiFinder> {
    if (AbiFinder.instance === null) {
      const realm = new Realm.App({
        id: REALM_APP_ID,
        // @ts-expect-error
        apiKey: REALM_APP_API_KEY,
        baseUrl: `https://${config.services.stitchHost}`,
        skipLocationRequest: true,
      });

      await realm.logIn(Realm.Credentials.apiKey(REALM_APP_API_KEY));

      const link = new HttpLink({
        uri: RealmUtil.getEndpoint(),
        fetch: async (uri, options) => {
          if (!realm.currentUser) {
            throw new Error('Must be logged in to use the GraphQL API');
          }

          await realm.currentUser.refreshCustomData();
          // @ts-expect-error
          options.headers.Authorization = `Bearer ${realm.currentUser.accessToken}`;
          return fetch(uri, options);
        },
      });

      const cache = new InMemoryCache();

      console.log(RealmUtil.getEndpoint());

      const apolloClient = new ApolloClient({ link, cache });

      AbiFinder.instance = new AbiFinder(
        new AbisRootContractStorageGql(apolloClient),
        new AbisContractTypesStorageGql(apolloClient),
        new AbisDynamicContractsStorageGql(apolloClient),
        new AbisFetcherHttp(config.services.dataUrl),
      );
    }

    return AbiFinder.instance;
  }

  //EVER
  public static async findAbi(address: string): Promise<Abi> {
    return (await (await this.getInstance()).findAbi(address)).abiFile;
  }

  public static async findFullAbi(address: string): Promise<FindAbiResult> {
    return await (await this.getInstance()).findAbi(address);
  }

  public static async findRoot(
    type: RootContractType,
    blockchain?: string,
  ): Promise<FindAbiResult> {
    return await (await this.getInstance()).findLatestRootContract(type, blockchain);
  }

  //BNB

  public static async findBNBAbi(address: string): Promise<AbiItem> {
    return (await (await this.getInstance()).findAbi(address, 'binance')).abiFile;
  }

  public static async findBNBFullAbi(address: string): Promise<FindBNBAbiResult> {
    return await (await this.getInstance()).findAbi(address);
  }

  public static async findBNBRoot(
    type: RootContractType,
    blockchain?: string,
  ): Promise<FindBNBAbiResult> {
    return await (await this.getInstance()).findLatestRootContract(type, blockchain);
  }

  public static async findAbiBySupertypeAndLevel(supertype: string, level: Level): Promise<any> {
    return await (await this.getInstance()).findAbiBySupertypeAndLevel(supertype, level);
  }

  private static async mutex<T extends () => Promise<unknown>>(
    callback: T,
  ): Promise<ReturnType<T>> {
    const mutexName = 'finding_abi';
    await mutexLockOrAwait(mutexName);

    try {
      return await callback();
    } finally {
      mutexUnlock(mutexName);
    }
  }

  public async findLatestRootContract(type: RootContractType, blockchain?: string): Promise<any> {
    return await AbiFinder.mutex(async () => {
      const result = await this.rootContractStorage.findLatestRootContract(type, blockchain);
      console.log('result', result);
      // assert(result !== null);
      console.log('FETCH ABI');
      let abiFile = null;
      if (type === 'endorsement1' || type === 'endorsement2' || type === 'endorsement3') {
        abiFile = (await this.fetchAbiFile(result!, 'trx', blockchain)) as Abi | AbiItem | null;
        assert(abiFile !== null);
      } else {
        abiFile = (await this.fetchAbiFile(result!, 'root', blockchain)) as Abi | AbiItem | null;
        assert(abiFile !== null);
      }

      return {
        longtype: result!.longtype,
        supertype: result!.supertype,
        abiFile,
        rootAddress: result!.address,
      } as any;
    });
  }

  public async findAbi(address: string, blockchain?: string): Promise<any> {
    return await AbiFinder.mutex(async () => {
      return await this.findAbiInternal(address, blockchain);
    });
  }

  public async findRootAbiBySupertype(supertypeName: string): Promise<FindAbiResult> {
    const result = await this.findAbiBySupertypeAndLevelInternal(supertypeName, 'root');
    assert(result !== null);

    return result;
  }

  public async findAbiBySupertypeAndLevel(supertype: string, level: string): Promise<any> {
    return await AbiFinder.mutex(async () => {
      const result = await this.findAbiBySupertypeAndLevelInternal(supertype, level);
      assert(result !== null);

      return result.abiFile;
    });
  }

  private async findAbiBySupertypeAndLevelInternal(
    supertypeName: string,
    level: string,
  ): Promise<FindAbiResult | null> {
    const rootContractAbiEntry = await this.rootContractStorage.findRootContractBySupertype(
      supertypeName,
    );
    if (!rootContractAbiEntry) return null;

    const abiFile = await this.fetchAbiFile(rootContractAbiEntry, level);
    if (!abiFile) return null;

    const { address, longtype, supertype } = rootContractAbiEntry;

    return { longtype, supertype, abiFile, rootAddress: address } as any;
  }

  private async findAbiInternal(address: string, blockchain?: string): Promise<FindAbiResult> {
    let rootContractAbiEntry = await this.rootContractStorage.findRootContractByAddress(address);

    console.log('rootContractAbiEntry', rootContractAbiEntry);

    let level = 'root';

    if (!rootContractAbiEntry) {
      const dynamicContractAbiEntry = await this.dynamicContractsStorage.findAbi(address);
      assert(dynamicContractAbiEntry !== null);

      const { supertype } = dynamicContractAbiEntry;
      level = dynamicContractAbiEntry.level;

      rootContractAbiEntry = await this.rootContractStorage.findRootContractBySupertype(supertype);
      assert(rootContractAbiEntry !== null);
    }

    const abiFile = await this.fetchAbiFile(rootContractAbiEntry, level, blockchain);
    assert(abiFile !== null);

    const { longtype, supertype } = rootContractAbiEntry;

    return { longtype, supertype, abiFile, rootAddress: rootContractAbiEntry.address } as any;
  }

  private async fetchAbiFile(
    rootContractAbiEntry: RootContractAbiEntry,
    level: string,
    blockchain?: string,
  ): Promise<Abi | AbiBSC | null> {
    console.log('BEGIN FETCH');
    let abiFilename = '';
    const { longtype, abiPath } = rootContractAbiEntry;
    console.log('rootContractAbiEntry', rootContractAbiEntry);
    const contractTypeEntry = await this.contractTypesStorage.findContractTypeAbi(
      longtype,
      level,
      blockchain,
    );
    console.log('contractTypeEntry', contractTypeEntry);
    if (!contractTypeEntry) return null;

    if (blockchain === 'binance' && rootContractAbiEntry.abiFile) {
      abiFilename = rootContractAbiEntry.abiFile;
    } else {
      abiFilename = contractTypeEntry.abiFilename;
    }

    return await this.abisFetcher.fetchAbiFile(abiPath, abiFilename, blockchain);
  }
}
