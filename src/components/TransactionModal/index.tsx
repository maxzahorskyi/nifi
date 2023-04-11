import React, { useEffect, useState } from 'react';
import classes from './index.module.scss';
import Button, { ButtonType } from '../../components/Button';
import ModalForm from '../Modal';
import moment from 'moment';
import { timeFormat } from '../../features/Home/Components/Timer';

const TransactionModal = (params: Props) => {
  const { isOpen, onCancel, disabled, loading } = params;

  const WarningIcon = () => (
    <svg
      viewBox="64 64 896 896"
      focusable="false"
      data-icon="warning"
      width="1em"
      height="1em"
      fill="#faad14"
      aria-hidden="true"
      style={{ marginRight: '10px' }}>
      <path
        d="M955.7 856l-416-720c-6.2-10.7-16.9-16-27.7-16s-21.6 5.3-27.7 16l-416
      720C56 877.4 71.4 904 96 904h832c24.6 0 40-26.6 27.7-48zM480
      416c0-4.4 3.6-8 8-8h48c4.4 0 8 3.6 8 8v184c0 4.4-3.6 8-8 8h-48c-4.4 0-8-3.6-8-8V416zm32
      352a48.01 48.01 0 010-96 48.01 48.01 0 010 96z"
      />
    </svg>
  );

  return (
    <ModalForm
      className={classes.modalHeader}
      visible={isOpen}
      onCancel={onCancel}
      title={
        <div className={classes.transactionModalTitleMobile}>
          <WarningIcon />
          Ever Surf transaction status
        </div>
      }>
      <div className={classes.transavtionModal}>
        <div className={classes.transavtionModal__body}>
          <p>
            When Ever Surf authorization will be successfully completed, you will be redirected to
            initial screen.
          </p>
          <p>Please ensure that you completed all respective procedures in Ever Surf.</p>
        </div>
        <div className={classes.transavtionModal__btn}>
          <Button
            disabled={disabled}
            loading={loading}
            styleType={ButtonType.Primary}
            onClick={() => {}}>
            {loading ? 'Processing' : 'Close'}
          </Button>
        </div>
      </div>
    </ModalForm>
  );
};

export default TransactionModal;

interface Props {
  isOpen: boolean;
  disabled: boolean;
  loading: boolean;
  onCancel: () => void;
}
