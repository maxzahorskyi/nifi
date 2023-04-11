import { useQuery } from '@apollo/client';
import { GQLContract, GQLContractSortByInput } from '../../types/graphql.schema';
import { getContract, getContractsSort } from '../../gql/query/contract';
import { TokenType, TokenTypeBSC } from '../../features/Token/TokenService';
import { ContractTypes } from '../../types/Tokens/Token';

export const useSuperSortType = ({ type, blockchain = 'everscale' }: Props): string | undefined => {
  const { data } = useQuery<{ contracts: GQLContract[] }>(getContractsSort, {
    errorPolicy: 'ignore',
    variables: {
      query: { longType: `nifi.${type}`, status: 'active', blockchain },
      sortBy: GQLContractSortByInput.ABIPATH_DESC,
    },
  });

  return data?.contracts[0]?.superType;
};

const useSuperType = ({ type }: Props): string | undefined => {
  const { data } = useQuery<{ contract: GQLContract }>(getContract, {
    errorPolicy: 'ignore',
    variables: { name: `nifi.${type}`, status: 'active' },
  });

  return data?.contract?.superType;
};

type Props = {
  type: TokenType | TokenTypeBSC | ContractTypes;
  blockchain?: 'binance' | 'everscale';
};

export default useSuperType;
