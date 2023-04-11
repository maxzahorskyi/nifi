import { useState } from 'react';
// eslint-disable-next-line camelcase
import { GQLContract, GQLContract_type } from '../types/graphql.schema';
import { useContractTypes } from './contract_types';
import { useContracts } from './contract';

const useGetContracts = ({}) => {
  // eslint-disable-next-line camelcase
  const [contractTypes, setContractTypes] = useState<GQLContract_type[] | undefined>();
  const [contracts, setContracts] = useState<GQLContract[] | undefined>();

  const { error, loading } = useContractTypes({
    skipQuery: false,
    variables: {},
    onSuccess: (data) => {
      if (data?.contract_types) {
        setContractTypes(data.contract_types);
      }
    },
    onError: (e) => console.log(e),
  });

  const { error: errorContract, loading: loadingContracts } = useContracts({
    skipQuery: false,
    variables: {},
    onSuccess: (data) => {
      if (data?.contracts) {
        setContracts(data.contracts);
      }
    },
    onError: (e) => console.log(e),
  });

  return {
    isFetching: loading || loadingContracts,
    error: error || errorContract,
    contractTypes,
    contracts,
  };
};

export default useGetContracts;
