import React, { CSSProperties } from 'react';
import useCommissions from '../../hooks/useCommissions';
import { useFormatAmount } from '../../hooks/useFormatPrice';
import CommissionUtil from '../../utils/CommissionUtil';
import getCurrentWallet from '../../utils/GetCurrentWallet';
import { CommissionTypes } from '../../types/CommissionTypes';
import TextList from '../TextList';

const Fees = ({ commissionsIds, reverseCommissions, style }: Props) => {
  const commissions = useCommissions();

  const suitableCommissions = CommissionUtil.getByIds(commissions, commissionsIds);

  return (
    <TextList
      items={reverseCommissions ? suitableCommissions.reverse() : suitableCommissions}
      getItemTitle={(commission) => (
        <span style={style} className="dottedTextListItem">
          • {commission.description.toLowerCase()}: {getCurrentWallet({ size: 14, line: 20 })}
          {useFormatAmount(commission.value || '0.00')}
        </span>
      )}
    />
  );
};

export default Fees;

interface Props {
  commissionsIds: CommissionTypes[];
  reverseCommissions?: boolean;
  style?: CSSProperties;
}
