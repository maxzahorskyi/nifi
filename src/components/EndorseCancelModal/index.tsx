import React from 'react';
import { message, Modal } from 'antd';
import { EndorseUtil } from '../../features/Token/utils/EndorseUtil';
import { useMutation } from 'react-query';
import TokenService from '../../features/Token/TokenService';
import useAuthContext from '../../hooks/useAuthContext';
import useTonClientBridge from '../../hooks/useTonClientBridge';
import { Formik } from 'formik';
import Button, { ButtonType } from '../Button';
import TonSurfModal from '../TonSurfModal';
import { TonSurfModalTypes } from '../../utils/TonSurfUtil';
import EverSurf from '../../config/ton/EverSurf';
import ModalForm from '../Modal';
import { CommissionTypes } from '../../types/CommissionTypes';

const initialState = {
  token: '',
  corner: '',
};

const EndorseCancelModal = ({ isOpen, closeModal, tokenAddress, stampID }: Props) => {
  const { walletAddress } = useAuthContext();
  const tonClientBridge = useTonClientBridge();
  const endorseMutation = useMutation(TokenService.requestEndorse);
  const [loading, setLoading] = React.useState<boolean>(false);
  const EndorseTools = new EndorseUtil(walletAddress, endorseMutation, tonClientBridge);
  const [tonSurfInput, setTonSurfInput] = React.useState<Record<any, any> | undefined>();
  const [isTonSurfModal, setTonSurfModal] = React.useState<boolean>(false);

  return (
    <>
      {!isTonSurfModal && (
        <Formik
          initialValues={initialState}
          onSubmit={async (values, formikHelpers) => {
            setLoading(true);
            await EndorseTools.cancelEndorse({
              tokenAddress: tokenAddress || '',
              onSuccess: () => {
                if (tonClientBridge instanceof EverSurf) {
                  setTonSurfModal(true);
                } else {
                  setLoading(false);
                  closeModal('cancel');
                }
              },
              stampID: stampID || '',
              setTonSurf: setTonSurfInput,
            });
          }}>
          {({ submitForm, values }) => (
            <ModalForm
              title="Cancelling endorsement"
              visible={isOpen}
              onCancel={() => closeModal()}
              commissionsIds={[CommissionTypes.EndorsementCancel]}>
              <Button
                styleType={ButtonType.Primary}
                onClick={submitForm}
                loading={loading}
                style={{ marginLeft: 'auto' }}>
                Cancel endorsement
              </Button>
            </ModalForm>
          )}
        </Formik>
      )}
      {isTonSurfModal && (
        <TonSurfModal
          type={TonSurfModalTypes.cancelEndorse}
          isOpen={isTonSurfModal}
          onCancel={closeModal}
          onSuccess={() => {
            message.success('Endorsement request is cancelled');
            setLoading(false);
            closeModal('cancel');
          }}
          input={tonSurfInput}
        />
      )}
    </>
  );
};

type Props = {
  isOpen: boolean;
  closeModal: (v?: 'request' | 'cancel') => void;
  stampID?: string;
  tokenAddress?: string;
};

export default EndorseCancelModal;
