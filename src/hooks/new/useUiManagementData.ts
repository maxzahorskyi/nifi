import { useQuery as useGqlQuery } from '@apollo/client';
import { useEffect, useState } from 'react';
import { GQLUi_management as GQLUiManagement } from '../../types/graphql.schema';
import { getUiManagement } from '../../gql/query/uiManagement';
import useDataContext from '../useDataContext';
import { UiManagementType } from '../../types/UiManagementType';

export const useUiManagementData = () => {
  const { uiManagementData, setUiManagementData } = useDataContext();
  const [uiManagementFilteredData, setUiManagementFilteredData] = useState<{
    [key: string]: GQLUiManagement[];
  }>();
  const [requestsCount, setRequestsCount] = useState<number>(0);

  const { data, loading } = useGqlQuery(getUiManagement, {
    errorPolicy: 'ignore',
    pollInterval: uiManagementData?.length || requestsCount === 1 ? 0 : 500,
  });

  useEffect(() => {
    !loading && setRequestsCount(requestsCount + 1);

    if (data && !loading) {
      setUiManagementData(data.ui_managements);
    }
  }, [data, loading]);

  useEffect(() => {
    if (!uiManagementData) return;
    const result = uiManagementData.reduce((previousValue: any, currentValue: GQLUiManagement) => {
      if (!currentValue?.moduleName) return;
      previousValue[currentValue.moduleName] = previousValue[currentValue.moduleName] || [];
      previousValue[currentValue.moduleName].push(currentValue);
      return previousValue;
    }, {});
    setUiManagementFilteredData(result);
  }, [uiManagementData]);

  const getUiManagementData = (moduleName: UiManagementType): GQLUiManagement[] | [] =>
    uiManagementFilteredData?.[moduleName] || [];

  return {
    getUiManagementData,
    isUiManagementData: !!uiManagementData?.length,
    isLoading: loading,
  };
};
