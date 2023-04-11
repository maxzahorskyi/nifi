import { useContext } from 'react';
import { ContractContext } from '../features/app';
// eslint-disable-next-line camelcase
import { GQLContract, GQLContract_type } from '../types/graphql.schema';

const useAuthContext = () => {
  const contextValue: AuthContextValue = useContext(ContractContext);

  return contextValue;
};

export default useAuthContext;

interface AuthContextValue {
  isFetching: boolean;
  contracts?: GQLContract[];
  // eslint-disable-next-line camelcase
  contractTypes?: GQLContract_type[];
  contractTypesByBlockchain?: GQLContract_type[];
}
