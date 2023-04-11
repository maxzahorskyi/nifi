import React, { useContext, useEffect, useState } from 'react';
import classes from './index.module.scss';
import { message } from 'antd';
import Button, { ButtonType } from '../../components/Button';
import QRCode from 'react-qr-code';
import { TonSurfModalTypes, TonSurfUtil } from '../../utils/TonSurfUtil';
import qs from 'query-string';
import Cookies from 'universal-cookie';
import getConfig from 'next/config';
import { useToken } from '../../hooks/tokens';
import useAuthContext from '../../hooks/useAuthContext';
import ArrowIcon from '../../../public/icons/arrowRight.svg';
import useWindowDimensions from '../../hooks/useWindowDimensions';
import { useSeries } from '../../hooks/series';

import { useAuction } from '../../hooks/auctions';
import { useBid } from '../../hooks/bids';
import { useAsk } from '../../hooks/asks';
import { useLocales } from '../../hooks/locales';
import TransactionModal from '../TransactionModal';
import { TokenType } from '../../features/Token/TokenService';
import { EndorseStatus } from '../../types/Endorse';
import { useEndorsement } from '../../hooks/endorsements';
import ModalForm from '../Modal';
import { GQLLocale } from '../../types/graphql.schema';
import TransactionStatus from '../../features/Token/components/TransactionStatus';
import { Auth } from '../../auth/Auth';
import { useRouter } from 'next/router';
import { TonClientContext } from '../../features/app';
import EverSurf from '../../config/ton/EverSurf';

const config = getConfig().publicRuntimeConfig.ton;
const DOMAIN = getConfig().publicRuntimeConfig.services.domain;

const cookies = new Cookies();

const TonSurfModal = (params: Props) => {
  const tonContext = useContext(TonClientContext);
  const { width, maxMobileWidth } = useWindowDimensions();
  const { walletAddress } = useAuthContext();
  const [TonSurfTools] = React.useState(new TonSurfUtil());
  const { isOpen, onCancel, onSuccess, type, input } = params;
  const [hashes, setHashes] = React.useState<
    { cookiesHash: string; confirmationHash: string; today: number } | undefined
  >();
  const [isTransactionSend, setTransactionSend] = React.useState<boolean>(false);
  const router = useRouter();
  const [isTransactionReceived, setTransactionReceived] = React.useState<boolean>(false);
  const [tonSurfLink, setTonSurfLink] = React.useState<any | undefined>(undefined);
  const [createdParams, setCreatedParams] = React.useState<Record<any, any> | undefined>();
  //locales string
  const [title, setTitle] = React.useState<string | undefined>();
  const [closeButtonText, setCloseButtonText] = React.useState<string | undefined>();
  const [linkButtonText, setLinkButtonText] = React.useState<string | undefined>();
  const [body1, setBody1] = React.useState<string | undefined>();
  const [body2, setBody2] = React.useState<string | undefined>();
  const [bullet1, setBullet1] = React.useState<string | undefined>();
  const [bullet2, setBullet2] = React.useState<string | undefined>();
  const [copyLinkButton, setCopyLinkButton] = React.useState<string | undefined>();
  const [isData, setData] = React.useState<GQLLocale[]>();
  const [isESDisable, setESDisable] = useState<boolean>(true);

  React.useEffect(() => {
    let timer: NodeJS.Timeout;

    if (isTransactionSend) {
      timer = setInterval(() => {
        if (cookies.get('currentTsWallet') !== walletAddress) {
          clearInterval(timer);
          window.location.reload();
        }
      }, 3000);
    }

    return () => clearInterval(timer);
  }, [isTransactionSend]);

  useLocales({
    skipQuery: false,
    variables: {
      query: {
        lang: 'EN',
        module: {
          type: width > maxMobileWidth ? 'desktop' : 'mobile',
          page: 'modal',
          module: modules[type],
        },
      },
    },
    onSuccess: (data) => {
      setData(data);
    },
    onError: (e) => {
      console.log(e);
    },
  });
  useEffect(() => {
    isData?.forEach((item) => {
      switch (item.stringName) {
        case 'title':
          setTitle(item.string);
          break;

        case 'closeButton':
          setCloseButtonText(item.string);
          break;

        case 'linkButton':
          setLinkButtonText(item.string);
          break;

        case 'body1':
          setBody1(item.string);
          break;

        case 'body2':
          setBody2(item.string);
          break;

        case 'bullet1':
          setBullet1(item.string);
          break;

        case 'bullet2':
          setBullet2(item.string);
          break;

        case 'copyLinkButton':
          setCopyLinkButton(item.string);
          break;

        default:
          break;
      }
    });
  }, [isData]);

  React.useEffect(() => {
    setHashes(TonSurfUtil.getHashes());
  }, [isData]);

  // const requestSurfAuth = Auth.requestSurfAuth('weq')

  useEffect(() => {
    if (hashes) {
      (async () => {
        let authMsg: string | undefined;
        let msg: string | undefined;
        switch (type) {
          case TonSurfModalTypes.authorization:
            // eslint-disable-next-line no-case-declarations
            const path =
              router.asPath === '/'
                ? `https://${DOMAIN}/?token={token}&walletAddress={walletAddress}`
                : qs.stringifyUrl(
                    {
                      url: `https://${DOMAIN}${router.asPath}`,
                      query: { token: '{token}', walletAddress: '{walletAddress}' },
                    },
                    {
                      encode: false,
                    },
                  );

            authMsg = await Auth.requestSurfAuth(path, tonContext.tonSurf as unknown as EverSurf);
            break;

          case TonSurfModalTypes.initialModal:
            msg =
              (await TonSurfTools[TonSurfModalTypes.authorization]({
                hash: hashes.confirmationHash,
              })) || undefined;
            break;

          case TonSurfModalTypes.createToken:
            msg =
              (await TonSurfTools[TonSurfModalTypes.createToken](
                {
                  dirtyCreatorFee: input?.dirtyCreatorFee || 0,
                  dirtyHash: input?.dirtyHash || '',
                  type: input?.type || TokenType.Art1,
                },
                (time) =>
                  setCreatedParams({
                    deployed: {
                      hash: input?.dirtyHash || '',
                    },
                  }),
              )) || undefined;
            break;

          case TonSurfModalTypes.acceptEndorse:
            msg =
              (await TonSurfTools[TonSurfModalTypes.acceptEndorse](
                {
                  sealAddress: input?.sealAddress || '',
                  stamp: input?.stamp || '',
                  place: input?.place || 0,
                },
                (time) =>
                  setCreatedParams({
                    deployed: {
                      tokenID: input?.stampID || '',
                      status: EndorseStatus.Executed,
                    },
                  }),
              )) || undefined;
            break;

          case TonSurfModalTypes.addToForever:
            msg =
              (await TonSurfTools[TonSurfModalTypes.addToForever](
                {
                  foreverAddress: input?.foreverAddress || '',
                  stampAddress: input?.stampAddress || '',
                },
                (time) =>
                  setCreatedParams({
                    tokenID: input?.stampID || '',
                    deployed: {
                      foreverID: input?.foreverID || '',
                    },
                  }),
              )) || undefined;
            break;

          case TonSurfModalTypes.cancelEndorse:
            msg =
              (await TonSurfTools[TonSurfModalTypes.cancelEndorse](
                {
                  tokenAddress: input?.tokenAddress || '',
                },
                (time) =>
                  setCreatedParams({
                    deployed: {
                      tokenID: input?.stampID || '',
                      status: EndorseStatus.Cancelled,
                    },
                  }),
              )) || undefined;
            break;

          case TonSurfModalTypes.requestEndorse:
            msg =
              (await TonSurfTools[TonSurfModalTypes.requestEndorse](
                {
                  tokenAddress: input?.tokenAddress || '',
                  value: input?.value || 0,
                  seal: input?.seal || '',
                  corners: input?.corners || {
                    cornerNE: false,
                    cornerNW: false,
                    cornerSE: false,
                    cornerSW: false,
                  },
                },
                (time) =>
                  setCreatedParams({
                    deployed: {
                      tokenID: input?.tokenID || '',
                      sealID: input?.sealID || '',
                      creator: input?.creator || '',
                      status: EndorseStatus.Pending,
                    },
                  }),
              )) || undefined;
            break;

          case TonSurfModalTypes.createSeries:
            msg =
              (await TonSurfTools[TonSurfModalTypes.createSeries](
                {
                  dirtyCreatorFee: input?.dirtyCreatorFee || 0,
                  dirtyHash: input?.dirtyHash || '',
                  limit: input?.limit || 0,
                },
                () =>
                  setCreatedParams({
                    deployed: {
                      hash: input?.dirtyHash || '',
                      creator: walletAddress,
                    },
                  }),
              )) || undefined;
            break;

          case TonSurfModalTypes.mintSeries:
            msg =
              (await TonSurfTools[TonSurfModalTypes.mintSeries](
                {
                  seriesAddress: input?.seriesAddress || '',
                  seriesId: input?.seriesId || '',
                  supply: input?.supply || 0,
                },
                (time) => setCreatedParams(time),
              )) || undefined;
            break;

          case TonSurfModalTypes.createAuction:
            msg =
              (await TonSurfTools[TonSurfModalTypes.createAuction](
                {
                  artToken: input?.artToken || '',
                  startBid: input?.startBid || 0,
                  stepBid: input?.stepBid || 0,
                  startTime: input?.startTime || 0,
                  endTime: input?.endTime || 0,
                  showcaseFees: input?.showcaseFees || 0,
                  tokenID: input?.tokenID || '',
                },
                (time) => setCreatedParams(time),
              )) || undefined;
            break;

          case TonSurfModalTypes.auctionManagement:
            msg =
              (await TonSurfTools[TonSurfModalTypes.auctionManagement](
                {
                  artToken: input?.artToken || '',
                  startTime: input?.startTime || 0,
                  auctionAddress: input?.auctionAddress || '',
                  endTime: input?.endTime || 0,
                  tokenID: input?.tokenID || '',
                },
                (time) => setCreatedParams(time),
              )) || undefined;
            break;

          case TonSurfModalTypes.bidCreation:
            msg =
              (await TonSurfTools[TonSurfModalTypes.bidCreation](
                {
                  artToken: input?.artToken || '',
                  endTime: input?.endTime || 0,
                  price: input?.price || '',
                },
                (time) => setCreatedParams(time),
              )) || undefined;
            break;

          case TonSurfModalTypes.makeBidAuction:
            msg =
              (await TonSurfTools[TonSurfModalTypes.makeBidAuction](
                {
                  auctionAddress: input?.auctionAddress || '',
                  bid: input?.bid || 0,
                },
                (time) => setCreatedParams(time),
              )) || undefined;
            break;

          case TonSurfModalTypes.createAsk:
            msg =
              (await TonSurfTools[TonSurfModalTypes.createAsk](
                {
                  token: input?.token || '',
                  showcaseFee: input?.showcaseFee || 0,
                  tokenID: input?.tokenID || '',
                  endTime: input?.endTime || 0,
                  creator: input?.creator || '',
                  price: input?.price || 0,
                },
                (time) => setCreatedParams(time),
              )) || undefined;
            break;

          case TonSurfModalTypes.askManagement:
            msg =
              (await TonSurfTools[TonSurfModalTypes.askManagement](
                {
                  token: input?.token || '',
                  startTime: input?.startTime || 0,
                  askAddress: input?.askAddress || '',
                  endTime: input?.endTime || 0,
                  tokenID: input?.tokenID || '',
                },
                (time) => setCreatedParams(time),
              )) || undefined;
            break;

          case TonSurfModalTypes.cancelAsk:
            msg =
              (await TonSurfTools[TonSurfModalTypes.cancelAsk](
                {
                  askAddress: input?.askAddress || '',
                },
                (time) => setCreatedParams(time),
              )) || undefined;
            break;

          case TonSurfModalTypes.changeAsk:
            msg =
              (await TonSurfTools[TonSurfModalTypes.changeAsk](
                {
                  price: input?.price || 0,
                  askAddress: input?.askAddress || '',
                },
                (time) => setCreatedParams(time),
              )) || undefined;
            break;

          case TonSurfModalTypes.acceptAsk:
            msg =
              (await TonSurfTools[TonSurfModalTypes.acceptAsk](
                {
                  price: input?.price || 0,
                  askAddress: input?.askAddress || '',
                },
                (time) => setCreatedParams(time),
              )) || undefined;
            break;

          case TonSurfModalTypes.bidManagement:
            msg =
              (await TonSurfTools[TonSurfModalTypes.bidManagement]({
                bidAddress: input?.bidAddress || '',
                endTime: input?.endTime || 0,
                tokenAddress: input?.tokenAddress || '',
              })) || undefined;
            break;

          case TonSurfModalTypes.acceptBid:
            msg =
              (await TonSurfTools[TonSurfModalTypes.acceptBid](
                {
                  bidAddress: input?.bidAddress || '',
                },
                (time) => setCreatedParams(time),
              )) || undefined;
            break;

          case TonSurfModalTypes.sendToken:
            msg =
              (await TonSurfTools[TonSurfModalTypes.sendToken](
                {
                  artTokenAddr: input?.artTokenAddr || '',
                  newOwner: input?.newOwner || '',
                },
                (time) => setCreatedParams(time),
              )) || undefined;
            break;

          default:
            break;
        }

        if (authMsg) {
          setTonSurfLink(authMsg);
        } else {
          setTonSurfLink(
            // @ts-ignore
            `https://uri.ever.surf/debot/${config.contractAddress.sessionRoot}?message=${msg?.message}&net=${config.surfNet}`,
          );
        }
      })();
    }
  }, [hashes]);

  useEndorsement({
    skipQuery:
      !isTransactionSend ||
      ![
        TonSurfModalTypes.requestEndorse,
        TonSurfModalTypes.cancelEndorse,
        TonSurfModalTypes.acceptEndorse,
      ].includes(type) ||
      !createdParams,
    variables: {
      query: createdParams,
    },
    pollInterval:
      [
        TonSurfModalTypes.requestEndorse,
        TonSurfModalTypes.cancelEndorse,
        TonSurfModalTypes.acceptEndorse,
      ].includes(type) && isTransactionSend
        ? 1000
        : undefined,
    onSuccess: (data) => {
      if (data?.deployed?.tokenID) {
        setTransactionReceived(true);
        setTransactionSend(false);
        onSuccess(data?.deployed.tokenID);
      }
    },
    onError: (e) => {
      console.log(e);
      message.error('Ton Surf Error');
    },
  });

  useBid({
    skipQuery:
      !isTransactionSend ||
      (type !== TonSurfModalTypes.bidCreation && type !== TonSurfModalTypes.acceptBid) ||
      !createdParams,
    variables: {
      query: createdParams,
    },
    pollInterval: 1000,
    onSuccess: (data) => {
      if (data.bidID) {
        setTransactionReceived(true);
        setTransactionSend(false);
        onSuccess(data.bidID);
      }
    },
    onError: (e) => {
      console.log(e);
      message.error('Ton Surf Error');
    },
  });

  useAuction({
    skipQuery:
      !isTransactionSend ||
      (type !== TonSurfModalTypes.createAuction &&
        type !== TonSurfModalTypes.auctionManagement &&
        type !== TonSurfModalTypes.makeBidAuction) ||
      !createdParams,
    variables: {
      query:
        type === TonSurfModalTypes.createAuction || type === TonSurfModalTypes.auctionManagement
          ? createdParams
          : {
              deployed: {
                auctionAddress: createdParams?.deployed?.auctionAddress,
                status: 'pending',
              },
            },
    },
    pollInterval: 1000,
    onSuccess: (data) => {
      if (
        data.deployed?.auctionAddress &&
        (type === TonSurfModalTypes.createAuction || type === TonSurfModalTypes.auctionManagement)
      ) {
        setTransactionReceived(true);
        setTransactionSend(false);
        onSuccess(data.deployed?.auctionAddress);
      } else if (
        data.deployed?.auctionAddress &&
        type === TonSurfModalTypes.makeBidAuction &&
        data.deployed.bids?.find((item) => {
          return item?.bidCreator === walletAddress && item?.bidValue === input?.bid.toString();
        })
      ) {
        setTransactionReceived(true);
        setTransactionSend(false);
        onSuccess(input?.userBids.toString());
      }
    },
    onError: (e) => {
      console.log(e);
      message.error('Ton Surf Error');
    },
  });

  useAsk({
    skipQuery:
      !isTransactionSend ||
      (type !== TonSurfModalTypes.createAsk &&
        type !== TonSurfModalTypes.askManagement &&
        type !== TonSurfModalTypes.cancelAsk &&
        type !== TonSurfModalTypes.changeAsk &&
        type !== TonSurfModalTypes.acceptAsk) ||
      !createdParams,
    variables: {
      query: createdParams,
    },
    pollInterval: 1000,
    onSuccess: (data) => {
      if (type === TonSurfModalTypes.changeAsk && data) {
        const lastPrice = data.deployed?.values?.[data.deployed?.values?.length - 1];
        const lastTime =
          lastPrice?.askValue === input?.price.toString() ? lastPrice?.askTime : undefined;
        if (!lastTime) return;
        setTransactionReceived(true);
        setTransactionSend(false);
        onSuccess(`${input?.price}`);
      } else if (
        (type === TonSurfModalTypes.createAsk || type === TonSurfModalTypes.askManagement) &&
        data?.deployed?.askAddress
      ) {
        setTransactionReceived(true);
        setTransactionSend(false);
        onSuccess(data.deployed?.askAddress);
      } else if (type === TonSurfModalTypes.cancelAsk) {
        setTransactionReceived(true);
        setTransactionSend(false);
        onSuccess(input?.askAddress);
      } else if (type === TonSurfModalTypes.acceptAsk && data?.deployed?.askAddress) {
        setTransactionReceived(true);
        setTransactionSend(false);
        onSuccess(data.deployed?.askAddress);
      }
    },
    onError: (e) => {
      console.log(e);
      message.error('Ton Surf Error');
    },
  });

  useToken({
    skipQuery:
      !isTransactionSend ||
      !(
        type === TonSurfModalTypes.createToken ||
        type === TonSurfModalTypes.mintSeries ||
        type === TonSurfModalTypes.sendToken ||
        type === TonSurfModalTypes.addToForever
      ),
    variables: {
      query: {
        deployed: {
          creator: walletAddress,
          owner: walletAddress,
        },
        ...createdParams,
      },
    },
    pollInterval: 1000,
    onSuccess: (data) => {
      if (
        (type === TonSurfModalTypes.createToken || type === TonSurfModalTypes.mintSeries) &&
        data?.tokenID
      ) {
        setTransactionReceived(true);
        setTransactionSend(false);
        onSuccess(data.tokenID);
      }

      if (type === TonSurfModalTypes.sendToken && data?.deployed?.owner) {
        setTransactionReceived(true);
        setTransactionSend(false);
        onSuccess(data.deployed?.owner);
      }

      if (type === TonSurfModalTypes.addToForever && data?.deployed?.foreverID) {
        setTransactionReceived(true);
        setTransactionSend(false);
        onSuccess(data.deployed?.foreverID);
      }
    },
    onError: (e) => {
      console.log(e);
      message.error('Ton Surf Error');
    },
  });

  useSeries({
    skipQuery: !isTransactionSend || type !== TonSurfModalTypes.createSeries,
    variables: {
      query: createdParams,
    },
    pollInterval: 1000,
    onSuccess: (data) => {
      if (data?.seriesID) {
        setTransactionReceived(true);
        setTransactionSend(false);
        onSuccess(data.seriesID);
      }
    },
    onError: (e) => {
      console.log(e);
      message.error('Ton Surf Error');
    },
  });
  return (
    <>
      <ModalForm
        okButtonProps={{ disabled: !isTransactionReceived }}
        onCancel={onCancel}
        visible={isOpen && !isTransactionSend}
        title={title}>
        {tonSurfLink && (
          <div className={classes.TSModal}>
            <div className={classes.TSModal__body}>
              {width >= maxMobileWidth ? (
                <>
                  <QRCode className={classes.TSModal__body_QRCode} value={tonSurfLink} />
                  <div className={classes.TSModal__body_text}>
                    {(type === TonSurfModalTypes.createAuction ||
                      type === TonSurfModalTypes.auctionManagement ||
                      type === TonSurfModalTypes.createAsk ||
                      type === TonSurfModalTypes.askManagement ||
                      type === TonSurfModalTypes.bidManagement ||
                      type === TonSurfModalTypes.acceptBid) && (
                      <TransactionStatus status="surf" type={type} />
                    )}
                    <p>{body1}</p>
                    <ul>
                      <li>{bullet1}</li>
                      <li>{bullet2}</li>
                    </ul>
                    <p>{body2}</p>
                    <a href={tonSurfLink} target="_blank" rel="noreferrer">
                      <div className={classes.tsLinkButton} onClick={() => setESDisable(false)}>
                        <div className={classes.TSlink}>
                          <ArrowIcon />
                          <span>{linkButtonText}</span>
                        </div>
                      </div>
                    </a>
                    <span
                      className={classes.copyLink}
                      onClick={() => {
                        navigator.clipboard.writeText(tonSurfLink);
                        setESDisable(false);
                      }}>
                      <ArrowIcon />
                      <span>{copyLinkButton}</span>
                    </span>
                  </div>
                </>
              ) : (
                <>
                  {(type === TonSurfModalTypes.createAuction ||
                    type === TonSurfModalTypes.auctionManagement ||
                    type === TonSurfModalTypes.createAsk ||
                    type === TonSurfModalTypes.askManagement ||
                    type === TonSurfModalTypes.bidManagement ||
                    type === TonSurfModalTypes.acceptBid) && (
                    <TransactionStatus status="surf" type={type} />
                  )}

                  <p>{body1}</p>
                  <a href={tonSurfLink} target="_blank" rel="noreferrer">
                    <div className={classes.tsLinkButton} onClick={() => setESDisable(false)}>
                      <div className={classes.TSlink}>
                        <ArrowIcon />
                        <span>{linkButtonText}</span>
                      </div>
                    </div>
                  </a>
                  <span
                    className={classes.copyLink}
                    onClick={() => {
                      navigator.clipboard.writeText(tonSurfLink);
                      setESDisable(false);
                    }}>
                    <ArrowIcon />
                    <span>{copyLinkButton}</span>
                  </span>
                  <p>{body2}</p>
                </>
              )}
            </div>
            <div className={classes.TSModal__btn}>
              <Button
                styleType={isESDisable ? ButtonType.Secondary : ButtonType.Primary}
                style={{ fontSize: 18, height: 46 }}
                onClick={() => {
                  if (type === TonSurfModalTypes.bidManagement) {
                    onSuccess(input?.bidAddress || '');
                    setTransactionReceived(true);
                  } else {
                    setTransactionSend(true);
                  }
                }}>
                {closeButtonText}
              </Button>
            </div>
          </div>
        )}
      </ModalForm>

      <TransactionModal
        isOpen={isTransactionSend}
        onCancel={() => {
          setTransactionSend(false);
        }}
        disabled={!isTransactionReceived}
        loading={!isTransactionReceived}
      />
    </>
  );
};

export default TonSurfModal;

interface Props {
  type: TonSurfModalTypes;
  isOpen: boolean;
  onCancel: () => void;
  onSuccess: (result: string) => void;
  input?: Record<any, any>;
}

const modules: { [key in TonSurfModalTypes]: string } = {
  [TonSurfModalTypes.authorization]: 'tonSurfModal',
  [TonSurfModalTypes.createToken]: 'TSCreateToken',
  [TonSurfModalTypes.requestEndorse]: 'TSRequestEndorse',
  [TonSurfModalTypes.createSeries]: 'TSCreateSeries',
  [TonSurfModalTypes.mintSeries]: 'TSMintToken',
  [TonSurfModalTypes.createAuction]: 'TSCreateAuction',
  [TonSurfModalTypes.auctionManagement]: 'TSAuctionManagement',
  [TonSurfModalTypes.bidCreation]: 'TSCreateBid',
  [TonSurfModalTypes.makeBidAuction]: 'TSMakeBidAuction',
  [TonSurfModalTypes.createAsk]: 'TSCreateAsk',
  [TonSurfModalTypes.askManagement]: 'TSAskManagement',
  [TonSurfModalTypes.cancelAsk]: 'TSCancelAsk',
  [TonSurfModalTypes.changeAsk]: 'TSChangeAsk',
  [TonSurfModalTypes.acceptAsk]: 'TSAcceptAsk',
  [TonSurfModalTypes.acceptBid]: 'TSAcceptBid',
  [TonSurfModalTypes.bidManagement]: 'TSBidManagement',
  [TonSurfModalTypes.sendToken]: 'TSSendToken',
  [TonSurfModalTypes.acceptEndorse]: 'TSAcceptEndorse',
  [TonSurfModalTypes.cancelEndorse]: 'TSCancelEndorse',
  [TonSurfModalTypes.addToForever]: 'TSAddToForever',
  [TonSurfModalTypes.initialModal]: 'initialModal',
};
