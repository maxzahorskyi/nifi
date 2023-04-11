import React, { useState } from 'react';
import { GQLUi_management as GQLUiManagement } from '../types/graphql.schema';

const defaultContextValue = {
  uiManagementData: undefined,
  setUiManagementData: (data: GQLUiManagement[]) => {},
};

export const DataContext = React.createContext(defaultContextValue);

const DataContextProvider: React.FC = (props) => {
  const [uiManagementData, setUiManagementData] = useState<GQLUiManagement[] | any>();

  return (
    <DataContext.Provider
      value={{
        uiManagementData,
        setUiManagementData,
      }}>
      {props.children}
    </DataContext.Provider>
  );
};

export default DataContextProvider;
