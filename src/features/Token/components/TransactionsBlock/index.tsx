import classes from '../../styles/index.module.scss';
import BigDividerMobile from '../../../../components/BigDividerMobile';
import EverIcon from '../../../../components/EverIcon';
import { useFormatAmount } from '../../../../hooks/useFormatPrice';
import { TokenSaleInfo, TokenSaleType } from '../../../../types/Tokens/Token';
import AuctionInfo from '../AuctionInfo';
import OffersInfo from '../OffersInfo';
import ActionButtonTop from '../ActionButtonTop';
import Button, { ButtonType } from '../../../../components/Button';
import { ModalType } from '../../../../types/modals/tokenPage';
import EverSurf from '../../../../config/ton/EverSurf';
import { TonSurfModalTypes } from '../../../../utils/TonSurfUtil';
import LikeBlock from '../../../../components/LikeBlock';
import PermanentProperties from '../PermanentProperties';
import { TokenType } from '../../TokenService';
import React, { useEffect, useState } from 'react';
import { Loading } from '../../pages/TokenPage';
import { ITokenInfoDto } from '../../../../types/Tokens/TokenInfo';
import useTonClientBridge from '../../../../hooks/useTonClientBridge';
import useAuthContext from '../../../../hooks/useAuthContext';
import useWindowDimensions from '../../../../hooks/useWindowDimensions';
import { GQLSeries, GQLUser } from '../../../../types/graphql.schema';
import { useBidTransactionHandler } from '../../../../hooks/bids';
import NoExtratonExceptionModal from '../../../../components/NoExtratonExceptionModal';
import TokenForms from '../TokenForms';
import Loader from '../Loader';
import { useNetworkError } from '../../../../hooks/useNetworkError';
import WarningIcon from '../WarningIcon';
import { setToStorage } from '../AskForms';
import TonUtil from '../../../../utils/TonUtil';
import { message } from 'antd';
import Cookies from 'universal-cookie';

const cookies = new Cookies();

const TransactionsBlock = ({
  loading,
  saleInfo,
  token,
  states,
  series,
  handlers,
  seal,
  foreverTokensNumber,
  frontStatus,
}: Props) => {
  const { isDesktopWidth } = useWindowDimensions();
  const [isEndorseOpen, setEndorse] = useState<boolean>(false);
  const [isAcceptOpen, setIsAcceptOpen] = useState<boolean>(false);
  const tonClientBridge = useTonClientBridge();
  const { user, walletAddress, networkError } = useAuthContext();
  const { onNetworkErrorClick } = useNetworkError();
  const [isNoExtratonExceptionShown, setIsNoExtratonExceptionShown] = useState(false);
  const { isMakeOfferFormShown, isSetUpAuctionFormShown, activeModal, creator, cta } = states;
  const {
    setActiveModal,
    setLoadingByKey,
    setAskToCancel,
    setAskFetching,
    setOwnerChanged,
    setTonSurfInput,
    setAcceptedOfferId,
    setIsMakeBidFormShown,
    setToken,
    setSeries,
    getTokenUserNickname,
  } = handlers;

  const showNoExtratonException = () => {
    setIsNoExtratonExceptionShown(true);
  };
  const hideNoExtratonException = () => {
    setIsNoExtratonExceptionShown(false);
  };

  const { acceptBestOffer } = useBidTransactionHandler({
    setLoadingByKey,
    showNoExtratonException,
  });
  // test start
  const [bidAccept, setBidAccept] = useState<boolean>(false);
  const [creationType, setCreationType] = useState<string | undefined>(undefined);
  const bidUseAccept = async (proceedAddress?: string) => {
    if (!saleInfo) return;
    await acceptBestOffer({
      saleInfo,
      onSuccess: () => {
        setLoadingByKey('acceptedOffer', false);
        if (tonClientBridge instanceof EverSurf) {
          setActiveModal(TonSurfModalTypes.bidManagement);
        } else {
          setAcceptedOfferId(saleInfo?.bestOffer?.bidID);
          setOwnerChanged(saleInfo?.bestOffer?.deployed.bidCreator);
          setActiveModal(undefined);
        }
      },
      onError: () => {},
      tonSurfSet: setTonSurfInput,
      proceedAddress,
    });
  };
  const [currentWallet] = React.useState<'everscale' | 'binance'>(
    cookies.get('blockchain') || 'everscale',
  );
  useEffect(() => {
    //for setup button
    if (
      token?.deployed?.frontStatus !== 'acceptingBids' ||
      saleInfo?.bestOffer?.deployed?.status === 'accepted' ||
      saleInfo?.bestOffer?.deployed?.status === 'pending' ||
      creationType === 'proceed' ||
      !creationType
    ) {
      return;
    }
    bidUseAccept().catch(console.error);
  }, [bidAccept]);
  useEffect(() => {
    //for proceed button
    if (
      token?.deployed?.frontStatus !== 'acceptingBids' ||
      saleInfo?.bestOffer?.deployed?.status === 'accepted' ||
      saleInfo?.bestOffer?.deployed?.status === 'created' ||
      creationType === 'setup' ||
      !creationType
    ) {
      return;
    }

    bidUseAccept(saleInfo?.bestOffer?.deployed?.bidAddress).catch(console.error);
  }, [creationType]);
  const makeBid = () => {
    setIsMakeBidFormShown(true);
    setActiveModal(ModalType.submittingBid);
  };

  const createABidHandle = () => {
    if (currentWallet === token?.raw?.blockchain) {
      setActiveModal(ModalType.creatingBid);
    } else if (currentWallet === 'binance') {
      message.warning('You need to switch to Everscale-compliant wallet');
    } else {
      message.warning('You need to switch to Binance-compliant wallet');
    }
  };

  const currentPrice = saleInfo?.currentPrice ?? 0;
  const isOwnToken = checkIsTokenOwn(token, walletAddress);
  const canCreateAuction =
    !!saleInfo?.saleType &&
    isOwnToken &&
    [TokenSaleType.Ask, TokenSaleType.Offer, TokenSaleType.Pending].includes(saleInfo?.saleType);
  const canMakeBid = !isOwnToken && saleInfo?.saleType === TokenSaleType.Auction;
  const canMakeOffer =
    !isOwnToken &&
    saleInfo?.saleType &&
    saleInfo.saleType !== TokenSaleType.Auction &&
    !token?.deployed?.foreverID &&
    token?.deployed?.frontStatus !== 'auction';
  const canAcceptOffer =
    isOwnToken &&
    !!saleInfo?.saleType &&
    [TokenSaleType.Ask, TokenSaleType.Offer].includes(saleInfo?.saleType) &&
    !!token?.bids;
  const canAcceptAsk = !isOwnToken && saleInfo?.saleType === TokenSaleType.Ask;
  const canSendToken =
    isOwnToken &&
    saleInfo?.saleType &&
    [TokenSaleType.Pending, TokenSaleType.Offer].includes(saleInfo.saleType);
  return (
    <div style={{ width: '100%' }}>
      {isDesktopWidth ? (
        <div className={classes.token__name}>{token?.raw?.title}</div>
      ) : (
        <BigDividerMobile paddingBottom={1} paddingTop={40} />
      )}

      <div className={classes.token__transaction}>
        <div className={classes.token__status}>
          {saleInfo && frontStatus && (
            <>
              <span>{frontStatus}</span>
              {token?.deployed?.frontStatus === 'onSale' && (
                <span className={classes.token__price}>
                  <EverIcon /> {useFormatAmount(currentPrice)}
                </span>
              )}
            </>
          )}
        </div>
        {token?.ask?.deployed?.status === 'created' && !activeModal && isOwnToken && (
          <div className={classes.token__askCreated}>
            <span>
              <WarningIcon /> There is non-finished fixed price sale setup transaction. Please
              proceed with setup
            </span>
            <div
              className={classes.token__askCreated_proceed}
              onClick={() => {
                setToStorage('creationType', 'proceed');
                setLoadingByKey('createAsk', true);
                setActiveModal(ModalType.saleOfferCreation);
              }}>
              <span>proceed</span>
            </div>
          </div>
        )}
        {token?.auction?.deployed?.status === 'created' && !activeModal && isOwnToken && (
          <div className={classes.token__askCreated}>
            <span>
              <WarningIcon /> There is non-finished auction setup transaction. Please proceed with
              setup
            </span>
            <div
              className={classes.token__askCreated_proceed}
              onClick={() => {
                setToStorage('creationType', 'proceed');
                setLoadingByKey('createAuction', true);
                setActiveModal(ModalType.creatingAuction);
              }}>
              <span>proceed</span>
            </div>
          </div>
        )}
        {saleInfo?.bestOffer?.deployed?.status === 'pending' && (
          <div className={classes.token__askCreated}>
            <span>
              <WarningIcon /> There is non-finished bid acceptance transaction. Please proceed with
              it
            </span>
            <div
              className={classes.token__askCreated_proceed}
              onClick={() => {
                if (creationType === 'proceed') {
                  setCreationType('proced');
                } else {
                  setCreationType('proceed');
                }
                setLoadingByKey('acceptOffer', true);
              }}>
              <span>proceed</span>
            </div>
          </div>
        )}
        {saleInfo && (
          <div className={classes.token__bids_data}>
            {saleInfo && token?.deployed?.frontStatus === 'auction' && (
              <div style={{ marginTop: 30 }}>
                <AuctionInfo saleInfo={saleInfo} />
              </div>
            )}

            {saleInfo && [TokenSaleType.Ask, TokenSaleType.Offer].includes(saleInfo.saleType) && (
              <div style={{ marginTop: 30 }}>
                {saleInfo.bestOffer && !isMakeOfferFormShown && (
                  <OffersInfo
                    className={classes.offersInfo}
                    saleInfo={saleInfo}
                    canAcceptOffer={canAcceptOffer}
                  />
                )}
              </div>
            )}
          </div>
        )}

        {token?.raw?.type === TokenType.Forever && foreverTokensNumber !== 4 ? undefined : (
          <ActionButtonTop
            loading={loading}
            saleInfo={saleInfo}
            token={token}
            states={{
              isSetUpAuctionFormShown,
              activeModal,
            }}
            handlers={{
              setActiveModal,
              setLoadingByKey,
              showNoExtratonException,
              setAskToCancel,
              setAskFetching,
              setOwnerChanged,
              setTonSurfInput,
            }}
          />
        )}

        <div
          className={
            !canCreateAuction && !canAcceptAsk && !saleInfo?.numberOfCustomers
              ? classes.token__btnTop
              : classes.token__btnBottom
          }>
          {canAcceptOffer && saleInfo?.bestOffer && (
            <Button
              style={{ width: '100%', marginTop: 30 }}
              styleType={ButtonType.Primary}
              type="button"
              onClick={() => {
                if (saleInfo.saleType === TokenSaleType.Ask) {
                  return setActiveModal(ModalType.offerCancellationRequired);
                }
                setCreationType('setup');
                setLoadingByKey('acceptOffer', true);
                setActiveModal(ModalType.acceptingBid);
                setTimeout(() => setBidAccept(!bidAccept), 3000);
              }}
              key="acceptOffer"
              loading={loading.acceptOffer}
              disabled={loading.acceptedOffer}>
              Accept bid
            </Button>
          )}

          {canMakeBid && !isMakeOfferFormShown && (
            <Button
              style={{ width: '100%', marginTop: 30 }}
              styleType={ButtonType.Secondary}
              type="button"
              onClick={!networkError ? makeBid : onNetworkErrorClick}
              key="setUpAuction">
              Make a bid
            </Button>
          )}

          {token?.raw?.type === TokenType.Forever && foreverTokensNumber !== 4
            ? undefined
            : canMakeOffer &&
              !isMakeOfferFormShown && (
                <Button
                  style={{ width: '100%', marginTop: 30 }}
                  styleType={ButtonType.Secondary}
                  type="button"
                  onClick={!networkError ? () => createABidHandle() : onNetworkErrorClick}
                  key="makeOffer">
                  Make a bid
                </Button>
              )}
        </div>
      </div>

      {loading.acceptedOffer && <Loader text="bid acceptance" />}

      {loading.sentToken && <Loader text="token sending" />}

      {!isDesktopWidth && <BigDividerMobile paddingBottom={1} paddingTop={40} />}

      <div className={classes.properties}>
        <LikeBlock
          token={token?.deployed?.type !== TokenType.Art2 ? token : series || undefined}
          shareModal
        />

        <PermanentProperties
          token={token}
          foreverTokensNumber={foreverTokensNumber}
          creator={creator}
          seal={seal}
          getTokenUserNickname={getTokenUserNickname}
          onSendToken={() => setActiveModal(ModalType.sendToken)}
          canSendToken={canSendToken}
          type={TokenType.Art1}
          stamp={token?.deployed?.type === TokenType.Stamp}
          saleType={saleInfo?.saleType}
          ownToken={token?.deployed?.owner === walletAddress}
          setEndorse={(v, result) => {
            setEndorse(v);
            switch (result) {
              case 'cancel':
                setLoadingByKey('cancelEndorsement', true);
                break;
              case 'request':
                setLoadingByKey('endorsement', true);
                break;
              case 'forever':
                setLoadingByKey('forever', true);
                break;
              default:
            }
          }}
          isEndorseOpen={isEndorseOpen}
          isAcceptOpen={isAcceptOpen}
          setIsAcceptOpen={setIsAcceptOpen}
        />
      </div>
      <NoExtratonExceptionModal
        isNoExtratonExceptionShown={isNoExtratonExceptionShown}
        hideNoExtratonException={hideNoExtratonException}
      />

      <TokenForms
        loading={loading}
        states={{ activeModal }}
        token={token}
        handlers={{
          setLoadingByKey,
          setTonSurfInput,
          setOwnerChanged,
          showNoExtratonException,
          setActiveModal,
        }}
      />
    </div>
  );
};

const saleTypeLabel = {
  [TokenSaleType.Auction]: 'Auction',
  [TokenSaleType.Offer]: 'Accepting bids',
  [TokenSaleType.Pending]: 'Accepting bids',
  [TokenSaleType.Endorsement]: 'On Endorsement',
  [TokenSaleType.Ask]: 'On Sale',
  [TokenSaleType.Forever]: 'Forever',
};

const checkIsTokenOwn = (token: ITokenInfoDto | undefined, walletAddress: string | undefined) => {
  return typeof walletAddress === 'string' && token?.deployed?.owner === walletAddress;
};

type Props = {
  loading: Partial<Loading>;
  seal?: any;
  states: {
    activeModal: ModalType | TonSurfModalTypes | undefined;
    isMakeOfferFormShown: boolean;
    isSetUpAuctionFormShown: boolean;
    creator: GQLUser | undefined;
    cta: boolean;
  };
  foreverTokensNumber?: number | undefined;
  series: GQLSeries | undefined;
  token: ITokenInfoDto | undefined;
  frontStatus: string | undefined;
  saleInfo: TokenSaleInfo | undefined;
  handlers: {
    setLoadingByKey: (key: keyof Loading, value: boolean, onToggle?: Function) => void;
    setActiveModal: (v: ModalType | TonSurfModalTypes | undefined) => void;
    setTonSurfInput: (v: Record<any, any>) => void;
    setOwnerChanged: (v: string | undefined) => void;
    setAskFetching: (v: boolean) => void;
    setAskToCancel: (v: boolean) => void;
    setAcceptedOfferId: (v: string | undefined) => void;
    setIsMakeBidFormShown: (v: boolean) => void;
    setToken: (v: ITokenInfoDto | undefined) => void;
    setSeries: (v: GQLSeries | undefined) => void;
    getTokenUserNickname: (userType: 'owner' | 'creator') => string | undefined;
  };
};

export default TransactionsBlock;
