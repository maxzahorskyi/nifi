import { useContext } from 'react';
import { Commission } from '../types/CommissionTypes';
import { CommissionsContext } from '../features/app';

const useCommissions = () => {
  return useContext(CommissionsContext) as Commission[] | undefined;
};

export default useCommissions;
