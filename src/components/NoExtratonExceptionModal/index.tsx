import React from 'react';
import NoExtratonException from '../NoExtratonException';
import ModalForm from '../Modal';

const NoExtratonExceptionModal = ({
  isNoExtratonExceptionShown,
  hideNoExtratonException,
}: Props) => {
  return (
    <ModalForm
      visible={isNoExtratonExceptionShown}
      onOk={hideNoExtratonException}
      onCancel={hideNoExtratonException}>
      <NoExtratonException />
    </ModalForm>
  );
};

interface Props {
  isNoExtratonExceptionShown: boolean;
  hideNoExtratonException: () => void;
}

export default NoExtratonExceptionModal;
