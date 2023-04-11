import { Abi } from '@eversdk/core';
// import { AbiItem } from 'web3-utils';
import { ContractInterface } from 'ethers';
import { mutexLockOrAwait, mutexUnlock } from '../../utils/mutex';
import { IAbisFetcher } from './abis-fetcher';

export interface AbiBSC {
  abi: ContractInterface;
  byteCode: string;
}

export default class AbisFetcherHttp implements IAbisFetcher {
  private readonly cache = new Map<string, Abi>();

  constructor(
    private readonly url: string, // eslint-disable-next-line no-empty-function, brace-style
  ) {}

  public async fetchAbiFile(
    abiPath: string,
    abiFilename: string,
    blockchain?: string,
  ): Promise<Abi | AbiBSC> {
    const mutexName = `fetching_abifile_${abiPath}_${abiFilename}`;
    await mutexLockOrAwait(mutexName);

    try {
      return await this.fetchAbiFileInternal(abiPath, abiFilename, blockchain);
    } finally {
      mutexUnlock(mutexName);
    }
  }

  private async fetchAbiFileInternal(
    abiPath: string,
    abiFilename: string,
    blockchain?: string,
  ): Promise<Abi | AbiBSC> {
    const isBinance = blockchain === 'binance';
    const cacheIndex = `${abiPath}_${abiFilename}`;

    const cacheEntry = this.cache.get(cacheIndex);
    if (cacheEntry) return cacheEntry;

    const abiType = isBinance ? 'abi/bsc' : 'abi';

    const url = `${this.url}/${abiType}/${abiFilename}?abiPath=${abiPath}&__t=r`;
    console.log('Fetching abi file...', `\n${url}`);

    const response = await fetch(url);
    const body = await response.text();

    if (!isBinance) {
      const abi: Abi = { type: 'Contract', value: JSON.parse(body) };

      this.cache.set(cacheIndex, abi);

      return abi;
    }

    const contractJson = JSON.parse(body);

    return { abi: contractJson.abi, byteCode: contractJson.bytecode };
  }
}
