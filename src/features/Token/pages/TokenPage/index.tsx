import React, { useEffect, useRef, useState } from 'react';
import formatISO9075 from 'date-fns/formatISO9075';
import UserInfo from '../../../../components/UserInfo';
import { useTranslation } from 'react-i18next';
import Table, { Column } from '../../../../components/Table';
import Title from '../../../../components/Title';
import classes from '../../styles/index.module.scss';
import TokenService, { ActionType, AskValue, OfferStatus, TokenType } from '../../TokenService';
import { useRouter } from 'next/router';
import getMediaUrl from '../../../../utils/getMediaUrl';
import TokenUtil from '../../utils/TokenUtil';
import Button, { ButtonType } from '../../../../components/Button';
import isNullish from '../../../../utils/isNullish';
import { Result, Skeleton } from 'antd';
import useAuthContext from '../../../../hooks/useAuthContext';
import AddressUtil from '../../../../utils/AddressUtil';
import Link from 'next/link';
import UserLink from '../../../../components/UserLink';
import UIExceptionUtil from '../../../../utils/UIExceptionUtil';
import Actor from '../../../Activity/components/Actor';
import useWindowDimensions from '../../../../hooks/useWindowDimensions';
import { ITokenInfoDto } from '../../../../types/Tokens/TokenInfo';
import { ApolloError, useQuery as useGqlQuery } from '@apollo/client';
import { getToken } from '../../../../gql/query/token';
import { getBids } from '../../../../gql/query/bid';
import { getActions } from '../../../../gql/query/action';
import {
  GQLAction,
  GQLActionTokenAttribute,
  GQLBid,
  GQLSeries,
  GQLUser,
} from '../../../../types/graphql.schema';
import { getSeries } from '../../../../gql/query/series';
import { getTime } from 'date-fns';
import BigDividerMobile from '../../../../components/BigDividerMobile';
import TokenMediaWrapper from '../../../../components/TokenMediaWrapper';
import { TonSurfModalTypes } from '../../../../utils/TonSurfUtil';
import { ModalType } from '../../../../types/modals/tokenPage';
import useTSModalHandle from '../../../../hooks/tonSurf/useTSModalHandle';
import { useEndorsement } from '../../../../hooks/endorsements';
import { EndorseStatus } from '../../../../types/Endorse';
import { useUser } from '../../../../hooks/users';
import { ContractTypes, TokenSaleType } from '../../../../types/Tokens/Token';
import Forms from '../../components/Forms';
import TransactionsBlock from '../../components/TransactionsBlock';
import { toFormatWalletAddress } from '../../../../utils/toFormatWalletAddress';
import ForeverTokens from '../../../../components/ForeverTokens';
import { TokenPageProps } from '../../types/types';
import { ErrorMessageByStatus } from '../../../../utils/errorMessageByStatus';
import CreateTokenButton from '../../../Activity/components/CreateTokenButton';
import Category from '../../../../components/Category';
import MetaTags from '../../components/MetaTags';
import Loader from '../../../../components/Loader';
import { useFrontStatus } from '../../../../hooks/status/useFrontStatus';
import useSuperType from '../../../../hooks/superType';

const TokenPage = (props: TokenPageProps) => {
  const { getFrontStatus } = useFrontStatus();
  const { t } = useTranslation();
  const router = useRouter();
  const [today] = useState(getTime(new Date()));
  const { walletAddress } = useAuthContext();
  const [createdOfferId, setCreatedOfferId] = useState<string | undefined>(undefined);
  const [acceptedOfferId, setAcceptedOfferId] = useState<string | undefined>();
  const [submittedBidId, setSubmittedBidId] = useState<number | undefined>(undefined);
  const [updateActions, setUpdateActions] = useState<boolean>(false);
  const [afterFormValue, setAfterFormValue] = React.useState<string | undefined>();
  const [isSetUpAuctionFormShown, setIsSetUpAuctionFormShown] = useState(false);
  const [isMakeBidFormShown, setIsMakeBidFormShown] = useState(false);
  const [isMakeOfferFormShown, setIsMakeOfferFormShown] = useState(false);
  const [activeModal, setActiveModal] = useState<ModalType | TonSurfModalTypes | undefined>(
    undefined,
  );
  const [stage, setStage] = useState<TonSurfModalTypes | undefined>(undefined);
  const [loading, setLoading] = useState<Partial<Loading>>({});
  const { width: innerWindowWidth, maxMobileWidth } = useWindowDimensions();
  const tokenReceiverAddress = useRef<string | undefined>(undefined);
  const [tokenError, setTokenError] = useState<ApolloError | null>(null);
  const [token, setToken] = useState<ITokenInfoDto | undefined>(props.token ?? undefined);
  const [seal, setSeal] = useState<ITokenInfoDto | undefined>(undefined);
  const [series, setSeries] = useState<GQLSeries>();
  const [creator, setCreator] = useState<GQLUser | undefined>();
  const [action, setAction] = useState();
  const [isAuctionCreated, setAuctionCreated] = useState<boolean>(false);
  const [tonSurfInput, setTonSurfInput] = React.useState<Record<string, any> | undefined>();
  const [tonSurfResult, setTonSurfResult] = React.useState<string | undefined>();
  const [isAskFetching, setAskFetching] = useState<boolean>(false);
  const [askToFind, setAskToFind] = useState<AskValue | undefined>(undefined);
  const [askToCancel, setAskToCancel] = useState<boolean>(false);
  const [isOwnerChanged, setOwnerChanged] = useState<string | undefined>(undefined);
  const [foreverTokensNumber, setForeverTokensNumber] = useState<number | undefined>(undefined);
  const [tokenID, setTokenID] = useState<string | undefined>();
  const [isLoader, setIsLoader] = useState<boolean>(false);
  const superTypeAuction = useSuperType({ type: ContractTypes.auc });
  useEffect(() => {
    setTokenID((router?.query?.id as string) || undefined);
    return () => showLoader();
  }, [router]);

  function showLoader() {
    setIsLoader(true);
    setTimeout(() => setIsLoader(false), 2000);
  }

  const preview = token?.raw?.media?.find(({ role }: any) => role === 'preview');
  const frame = token?.raw?.media?.find(({ role }: any) => role === 'frame');
  const stampImg = token?.raw?.media?.find(({ role }: any) => role === 'image');

  const tokenErrorStatusForResult = UIExceptionUtil.getStatus(tokenError?.extraInfo?.status);
  const saleInfo =
    token && (token.bids || token.auction || token.ask)
      ? TokenUtil.getSaleInfo({
          auction:
            token.auction?.deployed?.status === OfferStatus.Created
              ? undefined
              : token.auction || undefined,
          bids: token.bids,
          ask:
            token.ask?.deployed?.status === OfferStatus.Created ||
            token.ask?.deployed?.status === OfferStatus.Accepted
              ? undefined
              : token.ask,
          endorsement: token.endorsement,
          isAddedToForever: !!token.deployed?.foreverID,
        })
      : undefined;

  const setLoadingByKey = (key: keyof Loading, value: boolean, onToggle?: Function) => {
    setLoading((currentLoading) => {
      if (currentLoading[key] !== value && onToggle) {
        onToggle();
      }

      return {
        ...currentLoading,
        [key]: value,
      };
    });
  };
  const onCompletedDataGetting = async (token: ITokenInfoDto) => {
    if (saleInfo?.saleType === TokenSaleType.Auction) {
      setLoadingByKey('auction', false, () => setIsSetUpAuctionFormShown(false));
    }

    if (saleInfo?.saleType !== TokenSaleType.Endorsement && loading.cancelEndorsement) {
      setLoadingByKey('cancelEndorsement', false);
    }

    if (
      saleInfo?.saleType === TokenSaleType.Endorsement ||
      token.deployed?.type === TokenType.Seal
    ) {
      setLoadingByKey('endorsement', false);
    }

    if (loading.forever && token.deployed?.foreverID) {
      setLoadingByKey('forever', false);
    }

    const userBids = await getNumberOfUserBids(token);

    if (submittedBidId && userBids === submittedBidId) {
      setLoadingByKey('bid', false, () => setIsMakeBidFormShown(false));
      setSubmittedBidId(undefined);
    }

    if (isAuctionCreated && token.auction) {
      setAuctionCreated(false);
    }

    if (loading.ask && !token.ask && askToCancel) {
      setLoadingByKey('ask', false, () => setIsMakeBidFormShown(false));
      setUpdateActions(true);
      setAskToFind(undefined);
      setAskToCancel(false);
    }

    if (
      loading.acceptedAsk &&
      !token.ask &&
      askToCancel &&
      token.deployed?.owner === walletAddress
    ) {
      setLoadingByKey('ask', false, () => setIsMakeBidFormShown(false));
      setLoadingByKey('acceptedAsk', false);
      setOwnerChanged(undefined);
      setUpdateActions(true);
      setAskToFind(undefined);
      setAskToCancel(false);
    }

    if (
      !askToCancel &&
      loading.ask &&
      token?.ask?.deployed?.status !== OfferStatus.Created &&
      token.ask &&
      (askToFind ? token.ask.deployed?.currentAskValue === askToFind.askValue : true)
    ) {
      setLoadingByKey('ask', false, () => setIsMakeBidFormShown(false));
      setUpdateActions(true);
      setAskToFind(undefined);
    }

    if (
      acceptedOfferId &&
      token?.bids?.find((item: GQLBid) => item.bidID === acceptedOfferId)?.deployed?.status ===
        OfferStatus.Accepted
    ) {
      setLoadingByKey('acceptedOffer', false);
      setAcceptedOfferId(undefined);
    }

    if (createdOfferId && !!token?.bids?.find((item: GQLBid) => item.bidID === createdOfferId)) {
      setLoadingByKey('offer', false, () => setIsMakeOfferFormShown(false));
      setCreatedOfferId(undefined);
    }
    if (isOwnerChanged && token?.deployed?.owner === isOwnerChanged) {
      setOwnerChanged(undefined);
      setLoadingByKey('sentToken', false);
    }
    if (
      !isNullish(tokenReceiverAddress.current) &&
      token?.deployed?.ownerObject?.walletAddress === tokenReceiverAddress.current
    ) {
      setLoadingByKey('sentToken', false);
      tokenReceiverAddress.current = undefined;
    }
  };
  const getNumberOfUserBids = (token: ITokenInfoDto | undefined) => {
    if (!token?.auction) {
      return 0;
    }

    return (
      token.auction.deployed?.bids?.filter((bid) => bid?.bidCreator === walletAddress).length || 0
    );
  };
  const getTokenUserNickname = (userType: 'owner' | 'creator') => {
    if (userType === 'owner') {
      return token ? token.deployed?.ownerObject?.nickname : '';
    }
    if (userType === 'creator') {
      return creator ? creator?.nickname : AddressUtil.shorten(token?.deployed?.creator);
    }

    return 'anonymous';
  };

  const { loading: tokenLoading } = useGqlQuery(getToken, {
    errorPolicy: 'ignore',
    skip: props.isColPage,
    variables: {
      query: { tokenID },
    },
    pollInterval:
      isOwnerChanged ||
      loading.forever ||
      isAuctionCreated ||
      loading.endorsement ||
      loading.createAsk
        ? 1000
        : undefined,
    notifyOnNetworkStatusChange: true,
    onError: (error) => {
      setTokenError(error);
      console.log(error);
    },
    onCompleted: (data) => {
      if (!data?.token) {
        router.push('/404');
      }
      setToken((prev) => ({ ...prev, ...(data?.token || {}) }));
    },
  });
  const { loading: bidLoading } = useGqlQuery(getBids, {
    errorPolicy: 'ignore',
    skip: !tokenID,
    variables: {
      query: {
        deployed: {
          tokenID,
          endTime_gt: today / 1000,
          status_in: acceptedOfferId
            ? [OfferStatus.Accepted]
            : [OfferStatus.Created, OfferStatus.Pending],
        },
      },
    },
    onError: (error) => console.log(error),
    pollInterval: createdOfferId || acceptedOfferId || loading.acceptOffer ? 1000 : 0,
    notifyOnNetworkStatusChange: true,
    onCompleted: (data) => {
      setUpdateActions(true);
      setToken((prev) => ({ ...prev, bids: data?.bids }));
    },
  });

  const { loading: seriesLoading } = useGqlQuery(getSeries, {
    errorPolicy: 'ignore',
    skip: token?.deployed?.type !== 'art2',
    variables: {
      query: {
        seriesID: token?.deployed?.seriesID?.seriesID,
      },
    },
    onCompleted: (data) => {
      setSeries(data?.series || undefined);
    },
  });
  const { loading: actionsLoading } = useGqlQuery(getActions, {
    errorPolicy: 'ignore',
    skip: !token?.deployed?.address,
    onError: (error) => console.log(error),
    variables: {
      query: {
        OR: [
          {
            tokenAttributes: {
              tokenID: token?.tokenID,
            },
          },
          ...(token?.deployed?.type === TokenType.Art2
            ? [
                {
                  tokenAttributes: {
                    seriesID: {
                      seriesID: token?.deployed?.seriesID?.seriesID,
                    },
                  },
                },
              ]
            : []),
        ],
      },
    },
    pollInterval: updateActions ? 1000 : 0,
    notifyOnNetworkStatusChange: true,
    onCompleted: (data) => {
      setAction(data?.actions || undefined);
      setUpdateActions(false);
    },
  });

  const { loading: creatorLoading } = useUser({
    skipQuery: !token?.deployed?.creator,
    variables: {
      query: {
        walletAddress: token?.deployed?.creator,
      },
    },
    onSuccess: (data) => {
      setUpdateActions(true);
      setCreator(data?.user || undefined);
    },
    onError: (e) => console.log(e),
  });

  const { applyStage } = useTSModalHandle({
    stage,
    setActiveModal,
    loading,
    tonSurfResult,
  });

  useGqlQuery(getToken, {
    errorPolicy: 'ignore',
    skip: !token?.deployed?.seal,
    variables: {
      query: { tokenID: token?.deployed?.seal },
    },
    pollInterval: isOwnerChanged ? 1000 : 0,
    notifyOnNetworkStatusChange: true,
    onError: (error) => {
      setTokenError(error);
      console.log(error);
    },
    onCompleted: (data) => {
      setSeal(data?.token);
    },
  });

  useEndorsement({
    skipQuery: !tokenID,
    variables: {
      query: {
        deployed: {
          tokenID,
          status: EndorseStatus.Pending,
        },
      },
    },
    onError: (error) => console.log(error),
    pollInterval: loading.endorsement || loading.cancelEndorsement ? 1000 : 0,
    onSuccess: (data) => {
      setUpdateActions(true);
      setToken((prev) => ({ ...prev, endorsement: data }));
    },
  });

  useEffect(() => {
    switch (stage) {
      case TonSurfModalTypes.bidCreation:
        applyStage(setCreatedOfferId);
        break;
      case TonSurfModalTypes.makeBidAuction:
        applyStage(setSubmittedBidId);
        break;
      case TonSurfModalTypes.createAuction:
        applyStage((v) => {
          setTonSurfInput({
            ...tonSurfInput,
            auctionAddress: v,
          });
        });
        break;
      case TonSurfModalTypes.auctionManagement:
        applyStage(() => {
          setAuctionCreated(true);
        });
        break;
      case TonSurfModalTypes.cancelAsk:
        applyStage(setAskToCancel);
        break;
      case TonSurfModalTypes.changeAsk:
        applyStage(setAskToFind);
        setLoadingByKey('ask', true);
        break;
      case TonSurfModalTypes.createAsk:
        applyStage((v) => {
          setTonSurfInput({
            ...tonSurfInput,
            askAddress: v,
          });
        });
        break;
      case TonSurfModalTypes.acceptAsk:
        applyStage(() => {
          setOwnerChanged(walletAddress);
          setAskToCancel(true);
        });
        break;
      case TonSurfModalTypes.acceptBid:
        applyStage(() => {
          setAcceptedOfferId(saleInfo?.bestOffer?.bidID);
          setOwnerChanged(saleInfo?.bestOffer?.deployed.bidCreator);
        });
        break;
      case TonSurfModalTypes.sendToken:
        applyStage(setOwnerChanged);
        break;
      default:
        applyStage();
    }
  }, [stage]);

  useEffect(() => {
    if (
      !creatorLoading &&
      !seriesLoading &&
      !tokenLoading &&
      !actionsLoading &&
      !bidLoading &&
      token
    ) {
      onCompletedDataGetting(token).then(() => {});
    }
  }, [creatorLoading, seriesLoading, tokenLoading, actionsLoading, bidLoading]);

  if (tokenError) {
    return (
      <Result
        status={tokenErrorStatusForResult}
        title={tokenErrorStatusForResult}
        subTitle={ErrorMessageByStatus[tokenErrorStatusForResult]}
        extra={
          <Link href="/">
            <div className="centered">
              <Button styleType={ButtonType.Primary}>Back Home</Button>
            </div>
          </Link>
        }
      />
    );
  }

  if (!token || isLoader || !(token?.createdAt || series?.createdAt)) {
    return (
      <>
        <Loader text="Token is being loaded" height={70} />
        <MetaTags
          title={props.meta.title}
          description={props.meta.description}
          media={props.meta.media}
        />
      </>
    );
  }

  return (
    <>
      <MetaTags
        title={props.meta.title}
        description={props.meta.description}
        media={props.meta.media}
      />
      <div className={classes.buttonWrap}>
        {innerWindowWidth > maxMobileWidth && <CreateTokenButton />}
      </div>

      <UserLink userId={token?.deployed?.owner} className={classes.userInfo}>
        <UserInfo
          avatarUrl={
            token?.deployed?.ownerObject?.avatarHash &&
            getMediaUrl(token?.deployed?.ownerObject?.avatarHash, 'image', {
              width: innerWindowWidth > maxMobileWidth ? 80 : 50,
              height: innerWindowWidth > maxMobileWidth ? 80 : 50,
              compressionQuality: 70,
            })
          }
          name={
            <div className="username">
              {token?.deployed?.ownerObject ? (
                <>
                  <span>{getTokenUserNickname('owner')}</span>
                  <span>@{token?.deployed?.ownerObject?.username}</span>
                </>
              ) : (
                <>
                  <span>anonymous</span>
                  <span>{toFormatWalletAddress(token?.deployed?.owner)}</span>
                </>
              )}
            </div>
          }
        />
      </UserLink>

      <div className={classes.token}>
        <div className={classes.token__image}>
          {!token?.raw?.media?.length && token?.raw?.type !== TokenType.Forever && (
            <Skeleton.Image
              style={{
                width: innerWindowWidth > maxMobileWidth ? 500 : '100%',
                height: innerWindowWidth > maxMobileWidth ? 500 : 355,
              }}
            />
          )}

          {token?.raw?.media && token?.raw?.media?.length > 0 && (
            <>
              {token?.raw?.type === TokenType.Stamp ? (
                <TokenMediaWrapper
                  media={token.raw.media}
                  title={token?.raw?.title}
                  type={token?.deployed?.type}
                  tokenID={token?.tokenID}
                  maximum={token?.deployed?.seriesID?.deployed?.maximum}
                  frame={frame}
                  stampImg={stampImg}
                  preview={preview}
                  stamp={token?.raw?.type === TokenType.Stamp}
                />
              ) : (
                <TokenMediaWrapper
                  media={token.raw.media}
                  title={token?.raw?.title}
                  type={token?.deployed?.type}
                  tokenID={token?.tokenID}
                  maximum={token?.deployed?.seriesID?.deployed?.maximum}
                />
              )}
            </>
          )}

          {token?.raw?.type === TokenType.Forever && (
            <ForeverTokens
              setForeverTokensNumber={setForeverTokensNumber}
              foreverTitle={token?.raw?.title}
              foreverID={token?.tokenID}
            />
          )}
        </div>

        <TransactionsBlock
          states={{
            isSetUpAuctionFormShown,
            activeModal,
            isMakeOfferFormShown,
            creator,
            cta: token?.raw?.type === TokenType.Stamp,
          }}
          saleInfo={saleInfo}
          foreverTokensNumber={
            token?.raw?.type === TokenType.Forever ? foreverTokensNumber : undefined
          }
          frontStatus={getFrontStatus(token?.deployed?.frontStatus)}
          handlers={{
            setIsMakeBidFormShown,
            setActiveModal,
            setLoadingByKey,
            setAskToCancel,
            setAskFetching,
            setOwnerChanged,
            setTonSurfInput,
            setAcceptedOfferId,
            setToken,
            setSeries,
            getTokenUserNickname,
          }}
          series={series}
          token={token}
          seal={seal}
          loading={loading}
        />
      </div>

      {innerWindowWidth && innerWindowWidth <= maxMobileWidth && (
        <BigDividerMobile paddingBottom={0} paddingTop={40} />
      )}

      <div className={classes.activities}>
        {innerWindowWidth <= maxMobileWidth ? (
          <Category bgTitleColor="white" title={t('TokenPage.Activities')}>
            <div style={{ width: '100%' }}>
              <Table
                dataSource={action || []}
                columns={
                  innerWindowWidth > maxMobileWidth
                    ? activitiesTableConfig
                    : activitiesTableMobileConfig
                }
                width={innerWindowWidth}
              />
            </div>
          </Category>
        ) : (
          <>
            <Title className={classes.activities__title}>{t('TokenPage.Activities')}</Title>
            <div style={{ width: '100%' }}>
              <Table
                dataSource={action || []}
                columns={
                  innerWindowWidth > maxMobileWidth
                    ? activitiesTableConfig
                    : activitiesTableMobileConfig
                }
                width={innerWindowWidth}
              />
            </div>
          </>
        )}
      </div>

      <Forms
        token={token}
        setToken={setToken}
        superTypeAuction={superTypeAuction}
        today={today}
        loading={loading}
        saleInfo={saleInfo}
        states={{
          activeModal,
          afterFormValue,
          tonSurfInput,
          isOwnerChanged,
          submittedBidId,
          isAuctionCreated,
          isAskFetching,
          createdOfferId,
          isMakeBidFormShown,
        }}
        handlers={{
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
          setAuctionCreated,
          setCreatedOfferId,
        }}
      />
    </>
  );
};

export default TokenPage;

const activitiesTableConfig: Column<GQLAction>[] = [
  {
    title: 'Collector',
    key: 'collector',
    render: (action) => {
      const actorField = action.message?.actionCode?.actorField;
      const props: string[] = actorField?.split('.') || ['tokenAttributes', 'creator'];

      const desktopActivity = {
        display: 'flex',
        alignItems: 'center',
      };

      const mobileActivity = {
        display: 'flex',
        alignItems: 'center',
        width: '120px',
      };
      return (
        <span style={window.innerWidth > 1024 ? desktopActivity : mobileActivity}>
          <Actor
            address={
              action?.[props[0] as keyof GQLAction]?.[props[1] as keyof GQLActionTokenAttribute] ||
              ''
            }
          />
        </span>
      );
    },
  },
  {
    title: 'Activity',
    key: 'action',
    render: (action) => {
      if (!action.actionAttributes?.actionCapture) {
        return action.actionAttributes?.actionCapture;
      }

      return (
        TokenService.actionMessage[action.actionAttributes?.actionCapture as ActionType] ??
        action.actionAttributes?.actionCapture
      );
    },
  },
  {
    title: 'Date',
    key: 'date',
    render: ({ message }) => {
      if (message?.time) {
        return formatISO9075(message.time * 1000);
      }
      return 1;
    },
  },
];

const activitiesTableMobileConfig: Column<GQLAction>[] = [
  {
    title: 'Collector',
    key: 'collector',
    render: (action) => {
      const actorField = action.message?.actionCode?.actorField;
      const props: string[] = actorField?.split('.') || ['tokenAttributes', 'creator'];

      const desktopActivity = {
        display: 'flex',
        alignItems: 'center',
      };

      const mobileActivity = {
        display: 'flex',
        alignItems: 'center',
        width: '150px',
      };
      return (
        <span style={window.innerWidth > 1024 ? desktopActivity : mobileActivity}>
          <Actor
            address={
              action?.[props[0] as keyof GQLAction]?.[props[1] as keyof GQLActionTokenAttribute] ||
              ''
            }
          />
        </span>
      );
    },
  },
  {
    title: 'Activity',
    key: 'action',
    render: (action) => {
      if (!action.actionAttributes?.actionCapture) {
        return action.actionAttributes?.actionCapture;
      }
      const date = () => {
        if (action?.message?.time) {
          return formatISO9075(action?.message?.time * 1000);
        }
        return 1;
      };

      return (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            height: 36,
            justifyContent: 'space-between',
          }}>
          {TokenService.actionMessage[action.actionAttributes?.actionCapture as ActionType] ??
            action.actionAttributes?.actionCapture}
          <span>{date()}</span>
        </div>
      );
    },
  },
];

export interface Loading {
  createAuction: boolean;
  auction: boolean;
  forever: boolean;
  submitBid: boolean;
  bid: boolean;
  endorsement: boolean;
  cancelEndorsement: boolean;
  submitOffer: boolean;
  offer: boolean;
  acceptOffer: boolean;
  acceptAsk: boolean;
  acceptedOffer: boolean;
  sendToken: boolean;
  sentToken: boolean;
  ask: boolean;
  createAsk: boolean;
  acceptedAsk: boolean;
  changeAsk: boolean;
  cancelAsk: boolean;
  mintToken: boolean;
  mintedToken: boolean;
  savedOnBack: boolean;
  savingToken: boolean;
  tokenCreated: boolean;
}
