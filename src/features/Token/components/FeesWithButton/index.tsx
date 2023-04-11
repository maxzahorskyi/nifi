import React from 'react';
import classes from './index.module.scss';
import Cookies from 'universal-cookie';
import ArrowRightIcon from '../../../../../public/icons/arrowRight.svg';
import EverIcon from '../../../../components/EverIcon';
import Fees from '../../../../components/Fees';
import { CommissionTypes } from '../../../../types/CommissionTypes';
import useCommissions from '../../../../hooks/useCommissions';
import CommissionUtil from '../../../../utils/CommissionUtil';
import View from '../../../../types/View';
import useWindowDimensions from '../../../../hooks/useWindowDimensions';
import getCurrentWallet from '../../../../utils/GetCurrentWallet';
import useAuthContext from '../../../../hooks/useAuthContext';

const cookies = new Cookies();

const FeesWithButton = ({ commissionsIds, children }: Props) => {
  const { isDesktopWidth } = useWindowDimensions();
  const commissions = useCommissions();
  let suitableCommissions: any;
  let sumFees = 0;

  const fees = (commissionsIds: any) => {
    if (commissionsIds) {
      suitableCommissions = CommissionUtil.getByIds(commissions, commissionsIds);

      // console.log(suitableCommissions);

      suitableCommissions.forEach((item: any) => {
        sumFees += Number(item.value || '0.00');
      });
    }
    return sumFees;
  };

  return (
    <>
      {isDesktopWidth && children}
      <div className={classes.feesRow}>
        <div className={classes.feesTitle}>
          <ArrowRightIcon /> fees
        </div>
        <span className={classes.feesIcon}>
          {getCurrentWallet({ size: 18, line: 27 })}
          {fees(commissionsIds)}
        </span>
      </div>
      <div className={classes.list}>
        <Fees style={{ fontSize: 14 }} commissionsIds={commissionsIds} />
      </div>
      {!isDesktopWidth && children}
    </>
  );
};

export default FeesWithButton;

interface Props {
  commissionsIds: CommissionTypes[];
  children: View;
}
