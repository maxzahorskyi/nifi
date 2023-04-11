/* eslint-disable camelcase */
import { ApolloClient, NormalizedCacheObject } from '@apollo/client';
import { getAddressAbi } from '../../../gql/query/addressAbi';
import { GQLAddress_abi } from '../../../types/graphql.schema';
import {
  DynamicContractAbiEntry,
  IAbisDynamicContractsStorage,
} from './abis-dynamic-contracts-storage';

export class AbisDynamicContractsStorageGql implements IAbisDynamicContractsStorage {
  constructor(
    private readonly apolloClient: ApolloClient<NormalizedCacheObject>, // eslint-disable-next-line no-empty-function, brace-style
  ) {}

  public async findAbi(address: string): Promise<DynamicContractAbiEntry | null> {
    const { data } = await this.apolloClient.query<{ address_abi: GQLAddress_abi }>({
      query: getAddressAbi,
      variables: {
        query: {
          address,
        },
      },
      fetchPolicy: 'cache-first',
    });

    if (!data.address_abi) return null;

    return {
      address: data.address_abi.address || '',
      supertype: data.address_abi.superType || '',
      level: data.address_abi.level || '',
    };
  }
}
