/* eslint-disable no-continue */
/* eslint-disable no-restricted-syntax */
import { GQLContract } from '../../../types/graphql.schema';
import { ApolloClient, NormalizedCacheObject } from '@apollo/client';
import {
  IAbisRootContractStorage,
  RootContractAbiEntry,
  RootContractType,
} from './abis-root-contract-storage';
import { getContracts } from '../../../gql/query/contract';

export default class AbisRootContractStorageGql implements IAbisRootContractStorage {
  constructor(
    private readonly apolloClient: ApolloClient<NormalizedCacheObject>, // eslint-disable-next-line no-empty-function, brace-style
  ) {}

  private async getRootContracts(): Promise<RootContractAbiEntry[]> {
    const { data } = await this.apolloClient.query<{ contracts: GQLContract[] }>({
      query: getContracts,
      variables: {
        status: 'active',
      },
      fetchPolicy: 'cache-first',
    });

    return data.contracts.map((entry) => ({
      address: entry.address || '',
      supertype: entry.superType || '',
      longtype: entry.longType || '',
      abiPath: entry.abiPath || '',
      blockchain: entry.blockchain || '',
      abiFile: entry.abiFile,
    }));
  }

  private async findBy(
    predicate: (entry: RootContractAbiEntry) => boolean,
  ): Promise<RootContractAbiEntry | null> {
    const contracts = await this.getRootContracts();
    console.log('contracts', contracts);
    return contracts.find(predicate) || null;
  }

  public async findLatestRootContract(
    type: RootContractType,
    blockchain?: string,
  ): Promise<RootContractAbiEntry | null> {
    let contracts = await this.getRootContracts();

    if (blockchain) {
      contracts = contracts.filter(
        ({ blockchain: contractBlockchain }) => blockchain === contractBlockchain,
      );
    }

    let latestContract: {
      readonly contract: RootContractAbiEntry;
      readonly version: number;
    } | null = null;

    for (const contract of contracts) {
      const contractType = contract.supertype.slice(
        contract.supertype.indexOf('.') + 1,
        contract.supertype.lastIndexOf('.'),
      );

      if (contractType !== type) continue;

      const version = parseInt(
        contract.supertype.slice(contract.supertype.lastIndexOf('.') + 1),
        10,
      );
      if (Number.isNaN(version)) continue;

      if (version > (latestContract?.version ?? 0)) {
        latestContract = {
          contract,
          version,
        };
      }
    }

    return latestContract?.contract || null;
  }

  public async findRootContractByAddress(
    rootAddress: string,
  ): Promise<RootContractAbiEntry | null> {
    console.log('rootAddress', rootAddress);
    return await this.findBy((e) => e.address === rootAddress);
  }

  public async findRootContractBySupertype(
    supertype: string,
  ): Promise<RootContractAbiEntry | null> {
    return await this.findBy((e) => e.supertype === supertype);
  }
}
