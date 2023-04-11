import { message, Radio } from 'antd';
import { modalName, ModalType } from '../../../../types/modals/tokenPage';
import classes from '../../styles/index.module.scss';
import { saleSetup } from '../../TokenService';
import Button, { ButtonType } from '../../../../components/Button';
import React, { useEffect, useState } from 'react';
import { Loading } from '../../pages/TokenPage';
import { TonSurfModalTypes } from '../../../../utils/TonSurfUtil';
import ModalForm from '../../../../components/Modal';
import { Formik } from 'formik';
import EverSurf from '../../../../config/ton/EverSurf';
import SetUpAuctionForm from '../SetUpAuctionForm';
import MakeBidForm from '../MakeBidForm';
import useSuperType from '../../../../hooks/superType';
import { ContractTypes, TokenSaleInfo } from '../../../../types/Tokens/Token';
import { ITokenInfoDto } from '../../../../types/Tokens/TokenInfo';
import useAuthContext from '../../../../hooks/useAuthContext';
import { useAuctionTransactionHandler } from '../../../../hooks/auctions';
import useTonClientBridge from '../../../../hooks/useTonClientBridge';
import TransactionStatus from '../TransactionStatus';
import { walletTypes } from '../../../../types/wallet';
import { CommissionTypes } from '../../../../types/CommissionTypes';
import useWindowDimensions from '../../../../hooks/useWindowDimensions';
import Loader from '../Loader';
import TimeUtil from '../../../../utils/TimeUtil';
import TonUtil from '../../../../utils/TonUtil';
import { hasKey, setToStorage } from '../AskForms';

const AuctionForms = ({
  loading,
  handlers,
  states,
  token,
  saleInfo,
  aucCreateValues,
  setAucCreateValues,
  setAucValues,
  superTypeAuction,
}: Props) => {
  const tonClientBridge = useTonClientBridge();
  const { width, maxMobileWidth } = useWindowDimensions();
  const { walletAddress, type } = useAuthContext();
  const {
    afterFormValue,
    setActiveModal,
    setAfterFormValue,
    setLoadingByKey,
    showNoExtratonException,
    setTonSurfInput,
    setAuctionCreated,
    setSubmittedBidId,
  } = handlers;
  const { isMakeBidFormShown, activeModal, submittedBidId, isAuctionCreated } = states;
  const minimalPrice = saleInfo?.startPrice ?? 0;
  const step = saleInfo?.step ?? 0;
  const currentPrice = saleInfo?.currentPrice ?? 0;
  const minimalBidPrice =
    Math.round((currentPrice > 0 ? currentPrice + step : minimalPrice) * 1000000000) / 1000000000;

  const getNumberOfUserBids = (token: ITokenInfoDto | undefined) => {
    if (!token?.auction) {
      return 0;
    }

    return (
      token.auction.deployed?.bids?.filter((bid) => bid?.bidCreator === walletAddress).length || 0
    );
  };

  const { createAuction, submitBid } = useAuctionTransactionHandler({
    setLoadingByKey,
    showNoExtratonException,
  });
  const [aucCreate, setAucCreate] = useState<boolean>(false);
  const [creationType, setCreationType] = useState(
    localStorage.getItem('creationType') || undefined,
  );
  const loadingStatus = loading.createAuction ? token?.auction?.deployed?.status : undefined;
  const auctionUseCreate = async () => {
    if (!superTypeAuction) return;
    await createAuction({
      startTime:
        creationType === 'proceed' && token?.auction?.deployed?.startTime
          ? token?.auction?.deployed?.startTime * 1000
          : aucCreateValues.startTime,
      endTime:
        creationType === 'proceed' && token?.auction?.deployed?.endTime
          ? token?.auction?.deployed?.endTime * 1000
          : aucCreateValues.endTime,
      startBid:
        creationType === 'proceed'
          ? TonUtil.convertNanoTonToTon(Number(token?.auction?.deployed?.startBid))
          : aucCreateValues.startBid,
      stepBid:
        creationType === 'proceed'
          ? TonUtil.convertNanoTonToTon(Number(token?.auction?.deployed?.bidStep))
          : aucCreateValues.stepBid,
      superTypeAuction,
      token,
      onSuccess: () => {
        if (tonClientBridge instanceof EverSurf) {
          setActiveModal(TonSurfModalTypes.createAuction);
          setLoadingByKey('auction', true);
        } else {
          setAuctionCreated(true);
          setLoadingByKey('auction', true);
          setActiveModal(undefined);
        }
      },
      tonSurfSet: setTonSurfInput,
    });
  };

  useEffect(() => {
    //for setup button
    if (
      token?.deployed?.frontStatus === 'auction' ||
      token?.auction?.deployed?.status === 'pending' ||
      creationType === 'proceed' ||
      creationType === 'close' ||
      !creationType
    ) {
      return;
    }

    if (
      !aucCreateValues.endTime ||
      !aucCreateValues.startTime ||
      !aucCreateValues.startBid ||
      !aucCreateValues.stepBid
    ) {
      return;
    }
    if (Date.now() + 20 * 60 * 1000 > aucCreateValues.endTime) {
      setLoadingByKey('createAuction', false);
      message.error("Closing time shouldn't be in the past");
      return;
    }

    auctionUseCreate().catch(console.error);
  }, [aucCreate]);

  useEffect(() => {
    //for proceed button
    if (
      token?.deployed?.frontStatus === 'auction' ||
      token?.auction?.deployed?.status === 'pending' ||
      creationType === 'setup' ||
      creationType === 'close' ||
      !creationType
    ) {
      return;
    }

    auctionUseCreate().catch(console.error);
  }, [creationType]);

  useEffect(() => {
    if (isAuctionCreated) {
      const timeout = setTimeout(() => {
        if (isAuctionCreated) {
          setAuctionCreated(false);
          message.error('An error occurred while changing the owner');
        }
      }, 60000);
      return () => clearTimeout(timeout);
    }
    return () => {};
  }, [isAuctionCreated]);

  useEffect(() => {
    if (submittedBidId) {
      const timeout = setTimeout(() => {
        if (submittedBidId) {
          setSubmittedBidId(undefined);
          message.error('An error occurred while submitting the bid');
        }
      }, 60000);
      return () => clearTimeout(timeout);
    }
    return () => {};
  }, [submittedBidId]);

  return (
    <>
      <ModalForm
        title={modalName.auctionSaleSetupActive}
        visible={activeModal === ModalType.auctionSaleSetupActive}
        className={`${classes.modalAuctionOrSale} modal`}
        onCancel={() => setActiveModal(undefined)}>
        <Radio.Group
          defaultValue={afterFormValue}
          className={classes.radioButton}
          onChange={(e) => {
            setAfterFormValue(e.target.value);
          }}>
          {saleSetup ? (
            saleSetup.map((item, index) => {
              return (
                <Radio value={item} key={index}>
                  {item}
                </Radio>
              );
            })
          ) : (
            <div />
          )}
        </Radio.Group>
        <Button
          styleType={ButtonType.Primary}
          type="button"
          onClick={() => {
            afterFormValue === 'Cancel sale offer' &&
              setActiveModal(ModalType.saleOfferCancellation);
            afterFormValue === 'Change offer price' && setActiveModal(ModalType.salePriceChange);
            afterFormValue === 'Setup auction' &&
              setActiveModal(ModalType.offerCancellationRequired);
          }}
          loading={loading.createAuction}>
          Select
        </Button>
      </ModalForm>

      <Formik
        initialValues={initialSetUpAuctionFormValue}
        onSubmit={(values) => {
          if (!values.endTime || !values.startTime || !values.startBid || !values.stepBid) {
            message.error('All field are required');
            return;
          }
          setLoadingByKey('createAuction', true);
          //set values for getAsk
          setAucCreateValues(values);
          setAucValues({
            endTime: TimeUtil.convertTimestampToSeconds(values.endTime),
            startTime: TimeUtil.convertTimestampToSeconds(values.startTime),
            startBid: TonUtil.convertTonToNanoTon(values.startBid).toString(),
            stepBid: TonUtil.convertTonToNanoTon(values.stepBid).toString(),
          });
          //askCreate function trigger
          setTimeout(() => setAucCreate(!aucCreate), 3000);
        }}>
        {({ handleSubmit, values, setFieldValue }) => (
          <ModalForm
            title={modalName.creatingAuction}
            visible={activeModal === ModalType.creatingAuction}
            onCancel={() => {
              setToStorage('creationType', 'close');
              Object.keys(values).forEach((key) => {
                if (hasKey(values, key)) {
                  setFieldValue(key, 0);
                }
              });
              setAucCreateValues({ endTime: 0, startTime: 0, startBid: 0, stepBid: 0 });
              setAucValues({
                endTime: undefined,
                startTime: undefined,
                startBid: undefined,
                stepBid: undefined,
              });
              setLoadingByKey('auction', false);
              setActiveModal(undefined);
            }}
            commissionsIds={[CommissionTypes.AuctionCreation, CommissionTypes.AuctionManagement]}
            feesClassName={classes.auctionModalFees}>
            {width <= maxMobileWidth && (
              <TransactionStatus
                status={type === walletTypes.SF ? 'surf' : loadingStatus}
                token={token}
              />
            )}
            <SetUpAuctionForm
              proceedEndTime={creationType === 'proceed' ? token?.auction?.deployed?.endTime : 0}
              proceedStartTime={
                creationType === 'proceed' ? token?.auction?.deployed?.startTime : 0
              }
              proceedStartBid={
                creationType === 'proceed'
                  ? TonUtil.convertNanoTonToTon(Number(token?.auction?.deployed?.startBid))
                  : 0
              }
              proceedStepBid={
                creationType === 'proceed'
                  ? TonUtil.convertNanoTonToTon(Number(token?.auction?.deployed?.bidStep))
                  : 0
              }
              loading={loading}
              onSubmit={handleSubmit}
            />
            {width > maxMobileWidth && (
              <TransactionStatus
                status={type === walletTypes.SF ? 'surf' : loadingStatus}
                token={token}
              />
            )}
          </ModalForm>
        )}
      </Formik>

      <Formik
        initialValues={initialMakeBidFormValue}
        onSubmit={(values) => {
          (async () => {
            await submitBid({
              ...values,
              token,
              onSuccess: () => {
                if (tonClientBridge instanceof EverSurf) {
                  setActiveModal(TonSurfModalTypes.makeBidAuction);
                } else {
                  setSubmittedBidId(getNumberOfUserBids(token) + 1);
                  setActiveModal(undefined);
                }
                setLoadingByKey('bid', true);
              },
              userBids: getNumberOfUserBids(token) + 1,
              tonSurfSet: setTonSurfInput,
              minimalPrice: minimalBidPrice,
            });
          })();
        }}>
        {({ handleSubmit }) => (
          <ModalForm
            title={modalName.submittingBid}
            visible={activeModal === ModalType.submittingBid}
            className="modal"
            onOk={() => setActiveModal(undefined)}
            okButtonProps={{
              disabled: false,
            }}
            onCancel={() => setActiveModal(undefined)}
            feesClassName={classes.feesMakeBid}
            commissionsIds={[CommissionTypes.AuctionBidCreation]}>
            {loading?.bid && <Loader text="bid submission" />}

            {isMakeBidFormShown && (
              <MakeBidForm className={classes.form} loading={loading} onSubmit={handleSubmit} />
            )}
          </ModalForm>
        )}
      </Formik>
    </>
  );
};

type Props = {
  loading: Partial<Loading>;
  aucCreateValues: {
    startTime: number;
    endTime: number;
    startBid: number;
    stepBid: number;
  };
  setAucCreateValues: React.Dispatch<
    React.SetStateAction<{
      startTime: number;
      endTime: number;
      startBid: number;
      stepBid: number;
    }>
  >;
  setAucValues: React.Dispatch<
    React.SetStateAction<{
      startTime: number | undefined;
      endTime: number | undefined;
      startBid: string | undefined;
      stepBid: string | undefined;
    }>
  >;
  superTypeAuction: string | undefined;
  states: {
    isMakeBidFormShown: boolean;
    activeModal: ModalType | TonSurfModalTypes | undefined;
    isAuctionCreated: boolean | undefined;
    submittedBidId: number | undefined;
  };
  token: ITokenInfoDto | undefined;
  saleInfo: TokenSaleInfo | undefined;
  handlers: {
    setLoadingByKey: (key: keyof Loading, value: boolean, onToggle?: Function) => void;
    afterFormValue: string | undefined;
    setActiveModal: (v: ModalType | TonSurfModalTypes | undefined) => void;
    setAfterFormValue: (v: string | undefined) => void;
    showNoExtratonException: () => void;
    setTonSurfInput: (v: Record<any, any>) => void;
    setAuctionCreated: (v: boolean) => void;
    setSubmittedBidId: (v: number | undefined) => void;
  };
};

export const initialSetUpAuctionFormValue = {
  startTime: 0,
  endTime: 0,
  startBid: 0,
  stepBid: 0,
};

const initialMakeBidFormValue = {
  bidPrice: 0,
};

export default AuctionForms;
