import { Abi } from '@eversdk/core';
import { AbiItem } from 'web3-utils';

export type RootContractAbiEntry = {
  readonly address: string;
  readonly supertype: string;
  readonly longtype: string;
  readonly abiPath: string;
  readonly blockchain: string;
  readonly abiFile?: string;
};

export type RootContractType =
  | 'art1'
  | 'art2'
  | 'auc'
  | 'bid'
  | 'ask'
  | 'stamp1'
  // | 'endorsable'
  | 'seal'
  | 'for1'
  | 'collectible'
  | 'endorsement1'
  | 'endorsement2'
  | 'endorsement3';

export interface IAbisRootContractStorage {
  findLatestRootContract(
    type: RootContractType,
    blockchain?: string,
  ): Promise<RootContractAbiEntry | null>;

  findRootContractByAddress(rootAddress: string): Promise<RootContractAbiEntry | null>;

  findRootContractBySupertype(supertype: string): Promise<RootContractAbiEntry | null>;
}
