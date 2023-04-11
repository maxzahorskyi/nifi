/* eslint-disable camelcase */
import { ApolloClient, NormalizedCacheObject } from '@apollo/client';
import { getContractTypes } from '../../../gql/query/contractType';
import { GQLContract_type } from '../../../types/graphql.schema';
import { ContractTypeAbiEntry, IAbisContractTypesStorage } from './abis-contract-types-storage';
import assert from '../../../utils/assert';

export default class AbisContractTypesStorageGql implements IAbisContractTypesStorage {
  constructor(
    private readonly apolloClient: ApolloClient<NormalizedCacheObject>, // eslint-disable-next-line no-empty-function, brace-style
  ) {}

  private async getContractTypes(): Promise<GQLContract_type[]> {
    const { data } = await this.apolloClient.query<{
      contract_types: GQLContract_type[];
    }>({
      query: getContractTypes,
      fetchPolicy: 'cache-first',
    });

    return data.contract_types;
  }

  public async findContractTypeAbi(
    longtype: string,
    level: string,
  ): Promise<ContractTypeAbiEntry | null> {
    const contractTypes = await this.getContractTypes();
    console.log('contractTypes', contractTypes);

    const contractType = contractTypes.find((e) => e.longType === longtype);

    console.log('contractType', contractType);

    if (!contractType) {
      return null;
    }

    const abis = contractType.abi;
    console.log('abis', abis);
    if (!abis) return null;

    const abiFilename = abis[level as keyof GQLContract_type['abi']];
    console.log('abiFilename', abiFilename);

    assert(typeof abiFilename === 'string');

    return { longtype, abiFilename };
  }
}
