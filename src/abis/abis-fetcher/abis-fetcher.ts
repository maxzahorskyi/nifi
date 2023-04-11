import { Abi } from '@eversdk/core';
import { AbiBSC } from './abis-fetcher-http';

export interface IAbisFetcher {
  fetchAbiFile(abiPath: string, abiFilename: string, blockchain?: string): Promise<Abi | AbiBSC>;
}
