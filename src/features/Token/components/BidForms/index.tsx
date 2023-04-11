import ModalForm from '../../../../components/Modal';
import { modalName, ModalType } from '../../../../types/modals/tokenPage';
import { Formik } from 'formik';
import { generateBidId } from '../../../../utils/generateBidId';
import { TonSurfModalTypes } from '../../../../utils/TonSurfUtil';
import MakeOfferForm from '../MakeOfferForm';
import classes from '../../styles/index.module.scss';
import React from 'react';
import { Loading } from '../../pages/TokenPage';
import { ITokenInfoDto } from '../../../../types/Tokens/TokenInfo';
import { useBidTransactionHandler } from '../../../../hooks/bids';
import useSuperType from '../../../../hooks/superType';
import { ContractTypes } from '../../../../types/Tokens/Token';
import { CommissionTypes } from '../../../../types/CommissionTypes';
import Button, { ButtonType } from '../../../../components/Button';
import TransactionStatus from '../TransactionStatus';
import { OfferStatus } from '../../TokenService';
import Loader from '../Loader';

const BidForms = ({ loading, handlers, states, token, bestBidId }: Props) => {
  const superType = useSuperType({ type: ContractTypes.bid });

  const {
    setActiveModal,
    setLoadingByKey,
    showNoExtratonException,
    setTonSurfInput,
    setCreatedOfferId,
  } = handlers;
  const { activeModal } = states;
  const { submitOffer } = useBidTransactionHandler({
    setLoadingByKey,
    showNoExtratonException,
  });
  const bestBid = token?.bids?.find(({ bidID }: any) => bidID === bestBidId);
  return (
    <>
      <ModalForm
        title={modalName.acceptingBid}
        visible={loading.acceptOffer}
        className="modal"
        commissionsIds={[CommissionTypes.BidManagement, CommissionTypes.BidAccept]}
        onCancel={() => {
          setActiveModal(undefined);
        }}
        feesClassName={classes.bidModalFees}>
        <div className={classes.bidAcceptedWrapper}>
          <TransactionStatus
            status={bestBid?.deployed?.status === OfferStatus.Created ? undefined : 'created'}
            className={classes.bidAcceptedWrapper_status}
            token={token}
          />
          <Button loading={loading.acceptOffer} styleType={ButtonType.Primary}>
            Processing
          </Button>
        </div>
      </ModalForm>
      <Formik
        initialValues={initialMakeOfferFormValue}
        onSubmit={(values, { resetForm }) => {
          (async () => {
            if (!superType) {
              return;
            }
            await submitOffer({
              ...values,
              onSuccess: (id, parentAddress) => {
                if (id && parentAddress) {
                  setCreatedOfferId(generateBidId(parentAddress, id));
                  setActiveModal(undefined);
                } else {
                  setActiveModal(TonSurfModalTypes.bidCreation);
                }
                setLoadingByKey('offer', true);

                resetForm();
              },
              token,
              superType,
              tonSurfSet: setTonSurfInput,
            });
          })();
        }}>
        {({ handleSubmit }) => (
          <ModalForm
            title={modalName.creatingBid}
            visible={activeModal === ModalType.creatingBid}
            okButtonProps={{
              disabled: false,
            }}
            commissionsIds={[CommissionTypes.BidCreation]}
            feesClassName={classes.bidFees}
            onCancel={setActiveModal}>
            <MakeOfferForm
              style={{ marginTop: 30 }}
              className={classes.form}
              loading={loading}
              onSubmit={handleSubmit}
            />
          </ModalForm>
        )}
      </Formik>
    </>
  );
};

type Props = {
  loading: Partial<Loading>;
  states: {
    activeModal: ModalType | TonSurfModalTypes | undefined;
  };
  bestBidId?: string;
  token: ITokenInfoDto | undefined;
  handlers: {
    setLoadingByKey: (key: keyof Loading, value: boolean, onToggle?: Function) => void;
    setActiveModal: (v: ModalType | TonSurfModalTypes | undefined) => void;
    showNoExtratonException: () => void;
    setTonSurfInput: (v: Record<any, any>) => void;
    setCreatedOfferId: (v: string | undefined) => void;
  };
};

const initialMakeOfferFormValue = {
  offerPrice: 0,
  endTime: 0,
};

export default BidForms;
