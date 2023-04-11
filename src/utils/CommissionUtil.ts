/* eslint-disable no-empty-function */
import TonUtil from './TonUtil';

import { CommissionTypes, Commission } from '../types/CommissionTypes';
import { AuthLocalStorage } from '../auth/AuthLocalStorage';

class CommissionUtil {
  public static getById(commissions: Commission[] | undefined, commissionId: CommissionTypes) {
    if (!commissions) {
      return undefined;
    }

    const authLocalStorage = new AuthLocalStorage();
    const blockchain = authLocalStorage.getBlockchain();

    const filteredCommissions = commissions.filter(
      ({ blockchain: commissionBlockchain }) => commissionBlockchain === blockchain,
    );

    return filteredCommissions.find((commission) => commission.commissionId === commissionId);
  }

  public static getByIds(commissions: Commission[] | undefined, commissionIds: CommissionTypes[]) {
    if (!commissions) {
      return [];
    }

    const authLocalStorage = new AuthLocalStorage();
    const blockchain = authLocalStorage.getBlockchain();

    const filteredCommissions = commissions.filter(
      ({ blockchain: commissionBlockchain }) => commissionBlockchain === blockchain,
    );

    return filteredCommissions.filter((commission) => {
      return commissionIds.includes(commission.commissionId);
    });
  }

  public static getValueById(
    commissions: Commission[] | undefined,
    commissionId: CommissionTypes,
    format: 'readable' | 'blockchain',
  ) {
    const commission = CommissionUtil.getById(commissions, commissionId);
    if (!commission) {
      return undefined;
    }

    return format === 'blockchain'
      ? TonUtil.convertTonToNanoTon(+commission.value)
      : +commission.value;
  }
}

export default CommissionUtil;
