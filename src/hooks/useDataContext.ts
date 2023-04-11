import { useContext } from 'react';
import { DataContext } from '../contexts/DataContextProvider';
import { GQLUi_management as GQLUiManagement } from '../types/graphql.schema';

interface DataContextValuesType {
  uiManagementData: GQLUiManagement[] | undefined;
  setUiManagementData: (data: GQLUiManagement[]) => void;
}

const useDataContext = () => {
  const contextValue: DataContextValuesType = useContext(DataContext);
  return contextValue;
};

export default useDataContext;
