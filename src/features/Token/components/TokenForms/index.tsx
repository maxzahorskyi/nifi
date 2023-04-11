import { Formik } from 'formik';
import EverSurf from '../../../../config/ton/EverSurf';
import { TonSurfModalTypes } from '../../../../utils/TonSurfUtil';
import ModalForm from '../../../../components/Modal';
import { modalName, ModalType } from '../../../../types/modals/tokenPage';
import SendTokenForm from '../SendTokenForm';
import classes from '../../styles/index.module.scss';
import React from 'react';
import { Loading } from '../../pages/TokenPage';
import { ITokenInfoDto } from '../../../../types/Tokens/TokenInfo';
import useTonClientBridge from '../../../../hooks/useTonClientBridge';
import { useTokenTransactionHandler } from '../../../../hooks/tokens';
import { TokenType } from '../../TokenService';
import { CommissionTypes } from '../../../../types/CommissionTypes';

const TokenForms = ({ loading, handlers, states, token }: Props) => {
  const tonClientBridge = useTonClientBridge();
  const {
    setActiveModal,
    setLoadingByKey,
    showNoExtratonException,
    setTonSurfInput,
    setOwnerChanged,
  } = handlers;
  const { activeModal } = states;

  const { sendToken } = useTokenTransactionHandler({
    setLoadingByKey,
    showNoExtratonException,
    type: token?.deployed?.type as TokenType,
  });

  return (
    <Formik
      initialValues={initialSendTokenFormValue}
      onSubmit={async (values, formikHelpers) => {
        await sendToken({
          ...values,
          token,
          onSuccess: (receiverAddress) => {
            if (tonClientBridge instanceof EverSurf) {
              setActiveModal(TonSurfModalTypes.sendToken);
            } else {
              setOwnerChanged(receiverAddress);
              setActiveModal(undefined);
            }
            setLoadingByKey('sentToken', true);
            formikHelpers.resetForm();
          },
          tonSurfSet: setTonSurfInput,
        });
      }}>
      {({ submitForm, values }) => (
        <ModalForm
          title={modalName.sendTokenHandler}
          visible={activeModal === ModalType.sendToken}
          onCancel={setActiveModal}
          okButtonProps={{ dander: true }}
          commissionsIds={[CommissionTypes.TokenSend]}
          feesClassName={classes.sendModalFees}>
          <SendTokenForm
            submitForm={submitForm}
            loading={loading.sendToken}
            className={classes.sendTokenMobile}
          />
        </ModalForm>
      )}
    </Formik>
  );
};

const initialSendTokenFormValue = {
  receiverAddress: '',
};

type Props = {
  loading: Partial<Loading>;
  states: {
    activeModal: ModalType | TonSurfModalTypes | undefined;
  };
  token: ITokenInfoDto | undefined;
  handlers: {
    setLoadingByKey: (key: keyof Loading, value: boolean, onToggle?: Function) => void;
    setActiveModal: (v: ModalType | TonSurfModalTypes | undefined) => void;
    showNoExtratonException: () => void;
    setTonSurfInput: (v: Record<any, any>) => void;
    setOwnerChanged: (v: string | undefined) => void;
  };
};

export default TokenForms;
