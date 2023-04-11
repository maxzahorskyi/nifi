import { modalName, ModalType } from '../../../../types/modals/tokenPage';
import React, { useEffect, useState } from 'react';
import { Loading } from '../../pages/TokenPage';
import { TonSurfModalTypes } from '../../../../utils/TonSurfUtil';
import ModalForm from '../../../../components/Modal';
import { Formik } from 'formik';
import EverSurf from '../../../../config/ton/EverSurf';
import useSuperType from '../../../../hooks/superType';
import { ContractTypes } from '../../../../types/Tokens/Token';
import { ITokenInfoDto } from '../../../../types/Tokens/TokenInfo';
import useTonClientBridge from '../../../../hooks/useTonClientBridge';
import { initialSetUpAskFromValue } from '../../../../types/Ask';
import SaleForm from '../SaleForm';
import CancellationForm from '../CancellationForm';
import TonUtil from '../../../../utils/TonUtil';
import ChangePriceForm from '../ChangePriceForm';
import { useAskTransactionsHandler } from '../../../../hooks/asks';
import { AskValue } from '../../TokenService';
import WarningIcon from '../WarningIcon';
import Button, { ButtonType } from '../../../../components/Button';
import { walletTypes } from '../../../../types/wallet';
import TransactionStatus from '../TransactionStatus';
import useAuthContext from '../../../../hooks/useAuthContext';
import useWindowDimensions from '../../../../hooks/useWindowDimensions';
import { CommissionTypes } from '../../../../types/CommissionTypes';
import classes from '../../styles/index.module.scss';
import TimeUtil from '../../../../utils/TimeUtil';
import { message } from 'antd';

export const getFromStorage = (key: string) => {
  if (typeof window !== 'undefined') {
    window.localStorage.getItem(key);
  }
};

export const setToStorage = (key: string, value: string) => {
  if (typeof window !== 'undefined') {
    return window.localStorage.setItem(key, value);
  }
};
export function hasKey<O>(obj: O, key: PropertyKey): key is keyof O {
  return key in obj;
}

const AskForms = ({
  loading,
  handlers,
  states,
  token,
  setToken,
  setAskValues,
  askCreateValues,
  setAskCreateValues,
}: Props) => {
  const superTypeAsk = useSuperType({ type: ContractTypes.ask }) || '';
  const { width, maxMobileWidth } = useWindowDimensions();
  const tonClientBridge = useTonClientBridge();
  const { type } = useAuthContext();
  const [askCreate, setAskCreate] = useState<boolean>(false);
  const [creationType, setCreationType] = useState(
    localStorage.getItem('creationType') || undefined,
  );

  const {
    setActiveModal,
    setLoadingByKey,
    showNoExtratonException,
    setTonSurfInput,
    setAskFetching,
    setAskToCancel,
    setAskToFind,
  } = handlers;
  const { activeModal } = states;

  const { createAsk, cancelAsk, changeAsk } = useAskTransactionsHandler({
    setLoadingByKey,
    showNoExtratonException,
  });

  const loadingStatus = loading.createAsk ? token?.ask?.deployed?.status : undefined;

  const askUseCreate = async () =>
    createAsk({
      price:
        creationType === 'proceed'
          ? TonUtil.convertNanoTonToTon(Number(token?.ask?.deployed?.currentAskValue))
          : askCreateValues.price,
      endTime:
        creationType === 'proceed' && token?.ask?.deployed?.endTime
          ? token?.ask?.deployed?.endTime * 1000
          : askCreateValues.endTime,
      token,
      superTypeAsk,
      onSuccess: () => {
        if (tonClientBridge instanceof EverSurf) {
          setLoadingByKey('ask', true);
          setActiveModal(TonSurfModalTypes.createAsk);
        } else {
          setActiveModal(undefined);
          setAskFetching(true);
        }
      },
      tonSurfSet: setTonSurfInput,
    });
  useEffect(() => {
    //for setup button
    if (
      token?.deployed?.frontStatus === 'onSale' ||
      token?.ask?.deployed?.status === 'pending' ||
      creationType === 'proceed' ||
      creationType === 'close' ||
      !creationType
    ) {
      return;
    }

    if (!askCreateValues.endTime || !askCreateValues.price) {
      return;
    }
    if (Date.now() + 20 * 60 * 1000 > askCreateValues.endTime) {
      message.error("Closing time shouldn't be in the past");
      return;
    }
    askUseCreate().catch(console.error);
  }, [askCreate]);

  useEffect(() => {
    //for proceed button
    if (
      token?.deployed?.frontStatus === 'onSale' ||
      token?.ask?.deployed?.status === 'pending' ||
      creationType === 'setup' ||
      creationType === 'close' ||
      !creationType
    ) {
      return;
    }

    askUseCreate().catch(console.error);
  }, [creationType]);
  return (
    <>
      <ModalForm
        title={
          <>
            <WarningIcon />
            {modalName.offerCancellationRequired}
          </>
        }
        visible={activeModal === ModalType.offerCancellationRequired}
        className="modal"
        onCancel={() => setActiveModal(undefined)}>
        <div>
          <p>Please be advised that to accept a bid you need first to cancel existing offer.</p>
        </div>
        <Button
          styleType={ButtonType.Primary}
          onClick={() => {
            setActiveModal(ModalType.saleOfferCancellation);
          }}>
          Cancel offer
        </Button>
      </ModalForm>

      <Formik
        initialValues={initialSetUpAskFromValue}
        onSubmit={(values) => {
          setLoadingByKey('createAsk', true);
          //set values for getAsk
          setAskCreateValues(values);
          setAskValues({
            endTime: TimeUtil.convertTimestampToSeconds(values.endTime),
            price: TonUtil.convertTonToNanoTon(values.price).toString(),
          });
          //askCreate function trigger
          setTimeout(() => setAskCreate(!askCreate), 3000);
        }}>
        {({ submitForm, values, setFieldValue }) => (
          <ModalForm
            title={modalName.saleOfferCreation}
            className="modal"
            visible={activeModal === ModalType.saleOfferCreation}
            onCancel={() => {
              setToStorage('creationType', 'close');
              Object.keys(values).forEach((key) => {
                if (hasKey(values, key)) {
                  setFieldValue(key, 0);
                }
              });
              setAskCreateValues({ endTime: 0, price: 0 });
              setAskValues({
                endTime: undefined,
                price: undefined,
              });
              setLoadingByKey('createAsk', false);
              setActiveModal(undefined);
            }}
            okButtonProps={{
              danger: true,
            }}
            commissionsIds={[CommissionTypes.AskCreation, CommissionTypes.AskManagement]}
            reverseCommissions
            feesClassName={classes.auctionModalFees}>
            {width <= maxMobileWidth && (
              <TransactionStatus
                status={type === walletTypes.SF ? 'surf' : loadingStatus}
                token={token}
              />
            )}
            <SaleForm
              submitForm={submitForm}
              loading={loading.createAsk}
              proceedEndTime={creationType === 'proceed' ? token?.ask?.deployed?.endTime : 0}
              proceedPrice={
                creationType === 'proceed'
                  ? TonUtil.convertNanoTonToTon(Number(token?.ask?.deployed?.currentAskValue))
                  : 0
              }
              style={{ minHeight: type === walletTypes.SF ? 0 : 165 }}
            />
            {width > maxMobileWidth && (
              <TransactionStatus
                className={type !== walletTypes.SF && classes.transactionStatusAsk}
                status={type === walletTypes.SF ? 'surf' : loadingStatus}
                token={token}
              />
            )}
          </ModalForm>
        )}
      </Formik>

      <Formik
        initialValues={{}}
        onSubmit={async (values) => {
          await cancelAsk({
            ...values,
            askAddress: token?.ask?.deployed?.askAddress || '',
            onSuccess: () => {
              setLoadingByKey('ask', true);
              setToken((prev) => ({ ...prev, ask: undefined }));
              if (tonClientBridge instanceof EverSurf) {
                setActiveModal(TonSurfModalTypes.cancelAsk);
              } else {
                setActiveModal(undefined);
                setAskToCancel(true);
                setAskFetching(true);
              }
            },
            tonSurfSet: setTonSurfInput,
          });
        }}>
        {({ submitForm }) => (
          <ModalForm
            title={modalName.saleOfferCancellation}
            className="modal"
            visible={activeModal === ModalType.saleOfferCancellation}
            onCancel={() => setActiveModal(undefined)}>
            <CancellationForm submitForm={submitForm} loading={loading.cancelAsk} />
          </ModalForm>
        )}
      </Formik>

      <Formik
        initialValues={initialSetUpAskFromValue}
        onSubmit={(values) =>
          changeAsk({
            value: TonUtil.convertTonToNanoTon(values.price),
            ask: token?.ask,
            onSuccess: (value) => {
              if (tonClientBridge instanceof EverSurf) {
                setLoadingByKey('ask', true);
                setActiveModal(TonSurfModalTypes.changeAsk);
              } else {
                setAskToFind(value);
                setActiveModal(undefined);
              }
            },
            tonSurfSet: setTonSurfInput,
          })
        }>
        {({ submitForm, values }) => (
          <ModalForm
            title={modalName.salePriceChange}
            className="modal"
            visible={activeModal === ModalType.salePriceChange}
            onCancel={() => setActiveModal(undefined)}
            onOk={submitForm}
            okButtonProps={{
              danger: true,
            }}
            okText="Change price">
            <ChangePriceForm submitForm={submitForm} loading={loading.changeAsk || loading.ask} />
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
  token: ITokenInfoDto | undefined;
  setToken: React.Dispatch<React.SetStateAction<ITokenInfoDto | undefined>>;
  setAskValues: React.Dispatch<
    React.SetStateAction<{ endTime: number | undefined; price: string | undefined }>
  >;
  askCreateValues: { endTime: number; price: number };
  setAskCreateValues: React.Dispatch<React.SetStateAction<{ endTime: number; price: number }>>;
  handlers: {
    setLoadingByKey: (key: keyof Loading, value: boolean, onToggle?: Function) => void;
    setActiveModal: (v: ModalType | TonSurfModalTypes | undefined) => void;
    showNoExtratonException: () => void;
    setTonSurfInput: (v: Record<any, any>) => void;
    setAskFetching: (v: boolean) => void;
    setAskToCancel: (v: boolean) => void;
    setAskToFind: (v: AskValue) => void;
  };
};

export default AskForms;
