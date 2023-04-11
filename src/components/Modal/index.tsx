import React from 'react';
import { Modal, ModalProps } from 'antd';
import classes from './index.module.scss';
import cn from 'classnames';
import { CommissionTypes } from '../../types/CommissionTypes';
import Fees from '../Fees';
import ArrowRightIcon from '../../../public/icons/arrowRight.svg';
import useCommissions from '../../hooks/useCommissions';
import CommissionUtil from '../../utils/CommissionUtil';
import EverIcon from '../EverIcon';
import { useFormatAmount } from '../../hooks/useFormatPrice';
import getCurrentWallet from '../../utils/GetCurrentWallet';

const ModalForm = ({
  className,
  title,
  visible,
  children,
  onCancel,
  okButtonProps,
  onOk,
  feesClassName,
  commissionsIds,
  reverseCommissions,
  ...props
}: Props) => {
  const commissions = useCommissions();
  let suitableCommissions: any;
  let sumFees = 0;
  const fees = (commissionsIds: any) => {
    if (commissionsIds) {
      suitableCommissions = CommissionUtil.getByIds(commissions, commissionsIds);
      suitableCommissions.forEach((item: any) => {
        sumFees += Number(item.value);
      });
    }
    return sumFees;
  };
  fees(commissionsIds);
  return (
    <Modal
      title={title}
      className={cn(classes.modal, className, 'rounded')}
      visible={visible}
      onCancel={() => onCancel(undefined)}
      okButtonProps={okButtonProps}
      onOk={onOk}
      {...props}>
      {children}
      {commissionsIds && (
        <div className={cn(classes.feesBlock, feesClassName)}>
          <div className={classes.feesRow}>
            <div className={classes.feesTitle}>
              <ArrowRightIcon /> fees
            </div>
            <span className={classes.feesIcon}>
              {getCurrentWallet({ size: 18, line: 27 })} {useFormatAmount(sumFees.toFixed(2))}
            </span>
          </div>
          <Fees commissionsIds={commissionsIds} reverseCommissions={reverseCommissions} />
        </div>
      )}
    </Modal>
  );
};

export default ModalForm;

interface Props extends ModalProps {
  title?: any;
  className?: string;
  feesClassName?: string;
  visible?: boolean;
  children?: any;
  onCancel?: any;
  okButtonProps?: any;
  onOk?: any;
  commissionsIds?: CommissionTypes[];
  reverseCommissions?: boolean;
}
