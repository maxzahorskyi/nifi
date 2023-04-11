import { TonSurfModalTypes } from '../../../../utils/TonSurfUtil';
import { ModalType } from '../../../../types/modals/tokenPage';
import { message } from 'antd';
import { AskValue } from '../../TokenService';
import NoExtratonExceptionModal from '../../../../components/NoExtratonExceptionModal';
import TonSurfModal from '../../../../components/TonSurfModal';
import React, { useEffect, useState } from 'react';
import { TokenSaleInfo } from '../../../../types/Tokens/Token';
import { ITokenInfoDto } from '../../../../types/Tokens/TokenInfo';
import { Loading } from '../../pages/TokenPage';
import AuctionForms, { initialSetUpAuctionFormValue } from '../AuctionForms';
import AskForms from '../AskForms';
import BidForms from '../BidForms';
import { useQuery as useGqlQuery } from '@apollo/client';
import { getAsk } from '../../../../gql/query/ask';
import { initialSetUpAskFromValue } from '../../../../types/Ask';
import { getAuction } from '../../../../gql/query/auction';

const Forms = ({
  handlers,
  setToken,
  token,
  saleInfo,
  loading,
  states,
  superTypeAuction,
  today,
}: Props) => {
  const [isNoExtratonExceptionShown, setIsNoExtratonExceptionShown] = useState(false);

  const showNoExtratonException = () => {
    setIsNoExtratonExceptionShown(true);
  };

  const hideNoExtratonException = () => {
    setIsNoExtratonExceptionShown(false);
  };

  const {
    setActiveModal,
    setOwnerChanged,
    setLoadingByKey,
    setTonSurfInput,
    setAskFetching,
    setAfterFormValue,
    setAskToFind,
    setStage,
    setAskToCancel,
    setTonSurfResult,
    setSubmittedBidId,
    setCreatedOfferId,
    setAuctionCreated,
  } = handlers;

  const {
    afterFormValue,
    activeModal,
    isMakeBidFormShown,
    isAskFetching,
    isAuctionCreated,
    createdOfferId,
    tonSurfInput,
    isOwnerChanged,
    submittedBidId,
  } = states;

  useEffect(() => {
    if (isOwnerChanged) {
      const timeout = setTimeout(() => {
        if (isOwnerChanged) {
          setOwnerChanged(undefined);
          message.error('An error occurred while changing the owner');
        }
      }, 60000);
      return () => clearTimeout(timeout);
    }
    return () => {};
  }, [isOwnerChanged]);

  useEffect(() => {
    if (createdOfferId) {
      const timeout = setTimeout(() => {
        if (createdOfferId) {
          setCreatedOfferId(undefined);
          message.error('An error occurred while creating the bid');
        }
      }, 60000);
      return () => clearTimeout(timeout);
    }
    return () => {};
  }, [createdOfferId]);

  //// ask values for transaction
  const [askValues, setAskValues] = useState<{
    endTime: number | undefined;
    price: string | undefined;
  }>({ endTime: undefined, price: undefined });
  const [askCreateValues, setAskCreateValues] = useState<{
    endTime: number;
    price: number;
  }>(initialSetUpAskFromValue);

  useGqlQuery(getAsk, {
    errorPolicy: 'ignore',
    skip: !token?.tokenID,
    variables: {
      query: {
        deployed:
          token?.deployed?.frontStatus === 'onSale'
            ? {
                tokenID: token?.tokenID,
                status: 'pending',
                endTime_gt: today / 1000,
              }
            : {
                tokenID: token?.tokenID,
                endTime: askValues.endTime,
                endTime_gt: today / 1000,
                currentAskValue: askValues.price,
                status_in: ['pending', 'created'],
              },
      },
    },
    onError: (error) => console.log(error),
    pollInterval: loading.ask || loading.acceptedAsk || loading.createAsk ? 1000 : 0,
    notifyOnNetworkStatusChange: true,
    onCompleted: (data) => {
      setToken((prev) => ({ ...prev, ask: data?.ask }));
    },
  });
  //// auction values for transaction

  const [aucValues, setAucValues] = useState<{
    startTime: number | undefined;
    endTime: number | undefined;
    startBid: string | undefined;
    stepBid: string | undefined;
  }>({
    startTime: undefined,
    endTime: undefined,
    startBid: undefined,
    stepBid: undefined,
  });
  const [aucCreateValues, setAucCreateValues] = useState<{
    startTime: number;
    endTime: number;
    startBid: number;
    stepBid: number;
  }>(initialSetUpAuctionFormValue);

  useGqlQuery(getAuction, {
    errorPolicy: 'ignore',
    skip: !token?.tokenID,
    variables: {
      query: {
        deployed:
          token?.deployed?.frontStatus === 'auction'
            ? {
                tokenID: token?.tokenID,
                status: 'pending',
                endTime_gt: today / 1000,
              }
            : {
                tokenID: token?.tokenID,
                startTime: aucValues.startTime,
                endTime: aucValues.endTime,
                startBid: aucValues.startBid,
                bidStep: aucValues.stepBid,
                endTime_gt: today / 1000,
                status_in: ['pending', 'created'],
              },
      },
    },
    onError: (error) => console.log(error),
    pollInterval: loading.createAuction || loading.bid || isAuctionCreated ? 1000 : 0,
    notifyOnNetworkStatusChange: true,
    onCompleted: (data) => {
      setToken((prev) => ({ ...prev, auction: data?.auction }));
    },
  });

  useEffect(() => {
    if (isAskFetching) {
      const timeout = setTimeout(() => {
        if (isAskFetching) {
          setAskFetching(false);
          message.error('An error occurred while creating the ask');
        }
      }, 60000);
      return () => clearTimeout(timeout);
    }
    return () => {};
  }, [isAskFetching]);

  return (
    <>
      <NoExtratonExceptionModal
        isNoExtratonExceptionShown={isNoExtratonExceptionShown}
        hideNoExtratonException={hideNoExtratonException}
      />

      <BidForms
        loading={loading}
        states={{ activeModal }}
        bestBidId={saleInfo?.bestOffer?.bidID}
        token={token}
        handlers={{
          setActiveModal,
          setLoadingByKey,
          showNoExtratonException,
          setTonSurfInput,
          setCreatedOfferId,
        }}
      />

      {(activeModal === ModalType.offerCancellationRequired ||
        activeModal === ModalType.saleOfferCreation ||
        activeModal === ModalType.saleOfferCancellation ||
        activeModal === ModalType.salePriceChange) && (
        <AskForms
          loading={loading}
          setAskValues={setAskValues}
          askCreateValues={askCreateValues}
          setAskCreateValues={setAskCreateValues}
          states={{ activeModal }}
          token={token}
          setToken={setToken}
          handlers={{
            setActiveModal,
            setLoadingByKey,
            showNoExtratonException,
            setTonSurfInput,
            setAskFetching,
            setAskToCancel,
            setAskToFind,
          }}
        />
      )}

      {(activeModal === ModalType.auctionSaleSetupActive ||
        activeModal === ModalType.creatingAuction ||
        activeModal === ModalType.submittingBid) && (
        <AuctionForms
          aucCreateValues={aucCreateValues}
          setAucCreateValues={setAucCreateValues}
          setAucValues={setAucValues}
          loading={loading}
          superTypeAuction={superTypeAuction}
          states={{
            isMakeBidFormShown,
            activeModal,
            isAuctionCreated,
            submittedBidId,
          }}
          token={token}
          saleInfo={saleInfo}
          handlers={{
            afterFormValue,
            setActiveModal,
            setAfterFormValue,
            setLoadingByKey,
            showNoExtratonException,
            setTonSurfInput,
            setAuctionCreated,
            setSubmittedBidId,
          }}
        />
      )}

      {activeModal && activeModal in TonSurfModalTypes && (
        <TonSurfModal
          type={activeModal as TonSurfModalTypes}
          isOpen={activeModal in TonSurfModalTypes}
          onCancel={() => setActiveModal(undefined)}
          onSuccess={(result) => {
            setTonSurfResult(result);
            setStage(activeModal as TonSurfModalTypes);
            setActiveModal(undefined);
          }}
          input={tonSurfInput}
        />
      )}
    </>
  );
};

interface Props {
  saleInfo?: TokenSaleInfo;
  token?: ITokenInfoDto;
  setToken: React.Dispatch<React.SetStateAction<ITokenInfoDto | undefined>>;
  superTypeAuction: string | undefined;
  today: number;
  loading: Partial<Loading>;
  states: {
    afterFormValue: string | undefined;
    tonSurfInput: Record<any, any> | undefined;
    isAskFetching: boolean;
    isMakeBidFormShown: boolean;
    isAuctionCreated: boolean | undefined;
    isOwnerChanged: string | undefined;
    submittedBidId: number | undefined;
    createdOfferId: string | undefined;
    activeModal: ModalType | TonSurfModalTypes | undefined;
  };
  handlers: {
    setActiveModal: (v: ModalType | TonSurfModalTypes | undefined) => void;
    setLoadingByKey: (key: keyof Loading, value: boolean, onToggle?: Function) => void;
    setTonSurfInput: (v: Record<any, any>) => void;
    setOwnerChanged: (v: string | undefined) => void;
    setAskFetching: (v: boolean) => void;
    setStage: (v: TonSurfModalTypes) => void;
    setAskToFind: (v: AskValue) => void;
    setAfterFormValue: (v: string | undefined) => void;
    setAskToCancel: (v: boolean) => void;
    setTonSurfResult: (v: string | undefined) => void;
    setSubmittedBidId: (v: number | undefined) => void;
    setCreatedOfferId: (v: string | undefined) => void;
    setAuctionCreated: (v: boolean) => void;
  };
}

export default Forms;
