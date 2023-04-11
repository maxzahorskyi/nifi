import React, { useEffect, useRef, useState } from 'react';
import formatISO9075 from 'date-fns/formatISO9075';
import UserInfo from '../../../../components/UserInfo';
import { useTranslation } from 'react-i18next';
import Table, { Column } from '../../../../components/Table';
import Title from '../../../../components/Title';
import classes from '../../styles/index.module.scss';
import PermanentProperties from '../../components/PermanentProperties';
import { useMutation } from 'react-query';
import TokenService, { ActionCodes, ActionType, MediaDto, TokenType } from '../../TokenService';
import { useRouter } from 'next/router';
import getMediaUrl from '../../../../utils/getMediaUrl';
import MediaPreview from '../../../../components/MediaPreview';
import Button, { ButtonType } from '../../../../components/Button';
import useTonClientBridge from '../../../../hooks/useTonClientBridge';
import isNullish from '../../../../utils/isNullish';
import { message, Result, Skeleton, Spin } from 'antd';
import useAuthContext from '../../../../hooks/useAuthContext';
import AddressUtil from '../../../../utils/AddressUtil';
import NoExtratonExceptionModal from '../../../../components/NoExtratonExceptionModal';
import Link from 'next/link';
import UserLink from '../../../../components/UserLink';
import cn from 'classnames';
import Fees from '../../../../components/Fees';
import Properties from '../../../../components/Properties';
import { CommissionTypes } from '../../../../types/CommissionTypes';
import UIExceptionUtil from '../../../../utils/UIExceptionUtil';
import { ApolloError, useQuery, useQuery as useGqlQuery } from '@apollo/client';
import {
  GQLAction,
  GQLCol1,
  GQLContract,
  GQLSeries,
  GQLUser,
} from '../../../../types/graphql.schema';
import { getSeries } from '../../../../gql/query/series';
import { getContract } from '../../../../gql/query/contract';
import { getToken } from '../../../../gql/query/token';
import { generateMintedTokenId } from '../../../../utils/generateMintedTokenId';
import useWindowDimensions from '../../../../hooks/useWindowDimensions';
import { getActions } from '../../../../gql/query/action';
import LikeBlock from '../../../../components/LikeBlock';
import { getCol1 } from '../../../../gql/query/col1';
import { CollectiblesUtil } from '../../utils/CollectiblesUtil';
import TonSurfModal from '../../../../components/TonSurfModal';
import { TonSurfModalTypes } from '../../../../utils/TonSurfUtil';
import EverSurf from '../../../../config/ton/EverSurf';
import { useUser } from '../../../../hooks/users';
import { urls } from '../../../../types/pages';
import TokenMediaWrapper from '../../../../components/TokenMediaWrapper';
import BigDividerMobile from '../../../../components/BigDividerMobile';
import { ErrorMessageByStatus } from '../../../../utils/errorMessageByStatus';
import Loader from '../../components/Loader';
import MetaTags from '../../components/MetaTags';
import { TokenPageMingProps } from '../../types/types';

const checkIsCollectionOwn = (
  collection: GQLSeries | undefined,
  walletAddress: string | undefined,
) => {
  if (!collection || !walletAddress) {
    return false;
  }
  return collection?.deployed?.creator === walletAddress;
};

const TokenPageMint = ({ meta }: TokenPageMingProps) => {
  const { t } = useTranslation();
  const router = useRouter();
  const tonClientBridge = useTonClientBridge();
  const { walletAddress } = useAuthContext();
  const mintedTokenNumberBeforeMinting = useRef<number | undefined>(undefined);
  const [loading, setLoading] = useState<Partial<Loading>>({});
  const [isNoExtratonExceptionShown, setIsNoExtratonExceptionShown] = useState(false);
  const tokenMutation = useMutation(TokenService.mintToken);
  const [collectionError, setCollectionError] = useState<ApolloError | null>(null);
  const [col1, setCol1] = useState<GQLCol1 | undefined>(undefined);
  const [series, setSeries] = useState<GQLSeries | undefined>(undefined);
  const [creator, setCreator] = useState<GQLUser | undefined>();
  const [actions, setActions] = useState<GQLAction[] | undefined>();

  const showNoExtratonException = () => {
    setIsNoExtratonExceptionShown(true);
  };

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

  const CollectiblesTools = new CollectiblesUtil(
    walletAddress,
    undefined,
    tonClientBridge,
    showNoExtratonException,
    undefined,
  );

  const { data: contract } = useQuery<{ contract: GQLContract }>(getContract, {
    errorPolicy: 'ignore',
    variables: { name: 'nifi.art2', status: 'active' },
  });
  const { width: innerWindowWidth, maxMobileWidth } = useWindowDimensions();
  const collectionErrorStatusForResult = UIExceptionUtil.getStatus(
    collectionError?.clientErrors ? 500 : undefined,
  );

  const superType = contract?.contract?.superType || '';
  const id = router.query.id as string | undefined;
  // eslint-disable-next-line prefer-spread
  const tokenIDs = Array.apply(null, Array(series?.deployed?.supply || 0)).map(
    (item, key) => `${series?.seriesID}-${key + 1}`,
  );

  const [createdTokenId, setCreatedTokenId] = useState<string | undefined>(undefined);
  const [createdTokenTime, setCreatedTokenTime] = useState<number | undefined>(undefined);
  const [createdTokenInput, setCreatedTokenInput] = useState<Record<any, any> | undefined>(
    undefined,
  );

  useGqlQuery(getToken, {
    errorPolicy: 'ignore',
    skip: !createdTokenId,
    variables: {
      query: { tokenID: createdTokenId },
    },
    pollInterval: createdTokenId ? 1000 : 0,
    notifyOnNetworkStatusChange: true,
    onCompleted: (data) => {
      if (data?.tokenCol?.tokenId || data?.token?.tokenID) {
        router
          .push(
            // props.isColPage ? 'col1' :
            `/token/${data.token?.deployed?.type}/${
              data?.tokenCol?.tokenId || data?.token?.tokenID
            }`,
          )
          .then(() => {});
      }
    },
  });

  useGqlQuery<{ col1: GQLCol1 | undefined }>(getCol1, {
    errorPolicy: 'ignore',
    variables: {
      query: {
        seriesId: id,
      },
    },
    onCompleted: (updatedSeries) => {
      if (!updatedSeries) {
        return;
      }

      setCol1(updatedSeries.col1);
    },
    onError: (error) => {
      setCollectionError(error);
    },
  });

  useGqlQuery(getActions, {
    errorPolicy: 'ignore',
    skip: !series?.seriesID,
    variables: {
      query: {
        OR: [
          {
            tokenAttributes: {
              seriesID: {
                seriesID: series?.seriesID,
              },
            },
          },
          ...(series?.deployed?.supply && series?.deployed?.supply > 0
            ? [
                {
                  tokenAttributes: {
                    tokenID_in: tokenIDs,
                  },
                  message: {
                    actionCode: {
                      code: ActionCodes.Mint,
                    },
                  },
                },
              ]
            : []),
        ],
      },
    },
    onCompleted: (data) => {
      setActions(data.actions || data.actionCols || undefined);
    },
  });
  const { data: seriesData, loading: seriesLoading } = useGqlQuery(getSeries, {
    errorPolicy: 'ignore',
    variables: {
      query: {
        seriesID: id,
      },
    },
    onCompleted: (updatedSeries) => {
      if (!updatedSeries?.series) router.push('/404');
      if (!updatedSeries) {
        return;
      }

      if (
        !isNullish(mintedTokenNumberBeforeMinting.current) &&
        +updatedSeries.seriesID?.deployed?.supply > mintedTokenNumberBeforeMinting.current
      ) {
        setLoadingByKey('mintedToken', false);
        mintedTokenNumberBeforeMinting.current = undefined;
      }
    },
    onError: (error) => {
      setCollectionError(error);
    },
  });

  const isOwnCollection = checkIsCollectionOwn(series, walletAddress);
  const canMintToken = col1?.seriesId;

  useUser({
    skipQuery: !series?.deployed?.creator,
    variables: {
      query: {
        walletAddress: series?.deployed?.creator,
      },
    },
    onSuccess: (data) => setCreator(data.user),
    onError: (e) => console.log(e),
  });

  useEffect(() => {
    if (!seriesLoading && seriesData) {
      setSeries(seriesData.series);
    }
  }, [seriesData, seriesLoading]);

  useEffect(() => {
    if (createdTokenId) {
      const timeout = setTimeout(() => {
        setCreatedTokenId(undefined);
        message.error('An error occurred while creating the token').then(() => {});
      }, 60000);
      return () => clearTimeout(timeout);
    }
    return () => {};
  }, [createdTokenId]);

  const getTokenCreatorNickname = () => {
    if (creator) {
      return creator?.nickname;
    }

    if (series) {
      return AddressUtil.shorten(series?.deployed?.creator);
    }

    return 'anonymous';
  };
  const hideNoExtratonException = () => {
    setIsNoExtratonExceptionShown(false);
  };
  const mintToken = async () => {
    if (!series) {
      return;
    }

    try {
      setLoadingByKey('mintToken', true);
      await tokenMutation.mutateAsync({
        hash: series.deployed?.hash || '',
        owner: walletAddress || '',
        usersWhoShared: [],
        description: series.raw?.description || '',
        creatorFees: series.deployed?.creatorFees || '0',
        numberOfEditions: series.deployed?.maximum || 0,
        collectionID: series.raw?.collectionID || undefined,
        superType,
        media: (series.raw?.media?.map((item) => ({
          subtitle: item?.subtitle,
          mimetype: item?.mimetype,
          hash: item?.hash,
          width: item?.width,
          height: item?.height,
          weight: item?.weight,
        })) || []) as MediaDto[],
        creator: walletAddress || '',
        title: series.raw?.title || '',
        type: series.raw?.type as TokenType,
        seriesID: series.seriesID || '',
        qualification: 0,
      });

      mintedTokenNumberBeforeMinting.current = +(series?.deployed?.supply || 0);

      if (tonClientBridge instanceof EverSurf) {
        setCreatedTokenInput({
          seriesAddress: series.deployed?.address,
          seriesId: series.seriesID,
          supply: series.deployed?.supply,
        });

        return;
      }

      const { id } = await tonClientBridge.createArt2Token(series?.deployed?.address || '');
      const tokenId = generateMintedTokenId(series.seriesID || '', id);
      setCreatedTokenId(tokenId);

      message.success('The token has been successfully minted. You are redirected to its page');

      setLoadingByKey('mintedToken', true);
    } catch (e) {
      console.log(e);
      message.error('An error occurred while minting the token. Try somewhat later');
    } finally {
      setLoadingByKey('mintToken', false);
    }
  };

  if (collectionError) {
    return (
      <Result
        status={collectionErrorStatusForResult}
        title={collectionErrorStatusForResult}
        subTitle={ErrorMessageByStatus[collectionErrorStatusForResult]}
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

  if (seriesLoading || !series) {
    return (
      <div className="centered" style={{ minHeight: '50vh' }}>
        <MetaTags title={meta.title} description={meta.description} media={meta.media} />
        <Spin size="large" tip="Series is being loaded" />
      </div>
    );
  }

  return (
    <>
      <MetaTags title={meta.title} description={meta.description} media={meta.media} />
      {innerWindowWidth > maxMobileWidth && (
        <div className={classes.buttonWrap}>
          <Link href={urls.tokenCreate.default}>
            <a>
              <Button>{t('OnSalePage.CreateToken')}</Button>
            </a>
          </Link>
        </div>
      )}

      {creator ? (
        <UserLink
          userId={creator?.username ?? creator?.accountNumber ?? series?.deployed?.creator}
          className={classes.userInfo}>
          <UserInfo
            avatarUrl={
              creator?.avatarHash &&
              getMediaUrl(creator?.avatarHash, 'image', {
                width: 80,
                height: 80,
                compressionQuality: 70,
              })
            }
            name={
              <div className="username">
                <span>{getTokenCreatorNickname()}</span>
                <span>@{creator?.username}</span>
              </div>
            }
          />
        </UserLink>
      ) : (
        <UserLink userId={undefined} className={classes.userInfo}>
          <UserInfo
            avatarUrl={undefined}
            name={
              <div className="username">
                <span>anonymous</span>
                <span>{AddressUtil.shorten(series?.deployed?.creator)}</span>
              </div>
            }
          />
        </UserLink>
      )}

      <div className={classes.token}>
        <div className={classes.token__image}>
          {!series?.raw?.media && !col1?.layers?.[0]?.images && (
            <Skeleton.Image
              style={{
                width: innerWindowWidth > maxMobileWidth ? 500 : '100%',
                height: innerWindowWidth > maxMobileWidth ? 500 : 355,
              }}
            />
          )}

          {col1?.layers?.[0]?.images &&
            col1?.layers[0].images.length > 0 &&
            col1?.layers[0].images.map((params, index) => {
              if (
                params?.hash &&
                params?.width &&
                params?.height &&
                params?.mimetype &&
                params?.weight
              ) {
                const { hash, height, subtitle, weight, mimetype, width } = params;
                return (
                  <MediaPreview
                    hash={hash}
                    subtitle={subtitle}
                    number={index + 1}
                    meta={{
                      width,
                      height,
                      mimetype,
                      weight,
                    }}
                    hint="series"
                    title={series?.raw?.title ?? ''}
                    subtitleText={subtitle || ''}
                    imageArrayLength={series?.raw?.media?.length}
                  />
                );
              }
              return <></>;
            })}

          {series?.raw?.media && series?.raw?.media?.length > 0 && (
            <TokenMediaWrapper
              media={series.raw.media}
              title={series?.raw?.title}
              type={series?.deployed?.type}
              tokenID={series?.seriesID}
              maximum="series"
            />
          )}
        </div>

        <div style={{ width: '100%' }}>
          {innerWindowWidth > maxMobileWidth && (
            <div className={classes.token__name}>{series?.raw?.title}</div>
          )}
          <div className={classes.token__transaction_mint}>
            <div className={cn(classes.token__statusSeries, classes.token__statusSeries_inactive)}>
              <span>SERIES OF TOKENS</span>
            </div>

            <div className={classes.token__fees}>
              {isOwnCollection &&
                Number(series?.deployed?.supply || 0) < Number(series?.deployed?.maximum || 0) && (
                  <Properties
                    style={{ marginTop: 30 }}
                    className={classes.feesMint}
                    items={[
                      {
                        label: 'Fees',
                        value: <Fees commissionsIds={[CommissionTypes.TokenMint]} />,
                      },
                    ]}
                    renderItemLabel={(item) => item.label}
                    renderItemValue={(item) => item.value}
                    labelProps={{ className: classes.fees__label }}
                    valueProps={{ className: classes.fees__value }}
                  />
                )}
            </div>

            <div className={classes.token__mint_btn}>
              {canMintToken && (
                <Button
                  style={{ width: '100%', marginTop: 30 }}
                  styleType={ButtonType.Primary}
                  loading={loading.mintToken}
                  disabled={loading.mintedToken}
                  onClick={async () => {
                    await CollectiblesTools.mintToken({
                      seriesAddress: col1?.address || '',
                      mintCost: col1?.mintCost || 1,
                      onSuccess: (time: number) => {
                        setLoadingByKey('mintToken', false);
                        setLoadingByKey('mintedToken', true);
                        setCreatedTokenId(col1?.seriesId);
                        setCreatedTokenTime(time);
                      },
                      onExecute: () => {
                        setLoadingByKey('mintToken', true);
                      },
                      onError: () => {
                        setLoadingByKey('mintToken', false);
                      },
                    });
                  }}>
                  Mint token
                </Button>
              )}

              {isOwnCollection &&
                Number(series?.deployed?.supply || 0) < Number(series?.deployed?.maximum || 0) && (
                  <Button
                    style={{ width: '100%', marginTop: 30 }}
                    styleType={ButtonType.Primary}
                    loading={loading.mintToken}
                    disabled={loading.mintedToken}
                    onClick={mintToken}>
                    Mint token
                  </Button>
                )}
            </div>

            {loading.mintedToken && <Loader text="token minting" />}
          </div>

          {innerWindowWidth && innerWindowWidth <= maxMobileWidth && (
            <BigDividerMobile paddingTop={40} paddingBottom={5} />
          )}

          <div className={classes.properties}>
            <LikeBlock token={series} shareModal />

            <PermanentProperties
              series={series}
              creator={creator}
              getTokenUserNickname={getTokenCreatorNickname}
              type={TokenType.Art2}
            />
          </div>
        </div>
      </div>

      {innerWindowWidth <= maxMobileWidth && (
        <BigDividerMobile paddingTop={40} paddingBottom={40} />
      )}

      <div className={classes.activities}>
        <Title className={classes.activities__title}>{t('TokenPage.Activities')}</Title>

        {/* fixes bug with table responsiveness in Safari */}
        <div style={{ width: '100%' }}>
          <Table
            width={innerWindowWidth}
            dataSource={actions || []}
            columns={activitiesTableConfig}
          />
        </div>
      </div>

      <NoExtratonExceptionModal
        isNoExtratonExceptionShown={isNoExtratonExceptionShown}
        hideNoExtratonException={hideNoExtratonException}
      />

      {createdTokenInput && (
        <TonSurfModal
          type={TonSurfModalTypes.mintSeries}
          isOpen={!!createdTokenInput}
          onCancel={() => setCreatedTokenInput(undefined)}
          onSuccess={(result) => {
            setCreatedTokenInput(undefined);
            setCreatedTokenId(result);
          }}
          input={createdTokenInput}
        />
      )}
    </>
  );
};

export default TokenPageMint;

const activitiesTableConfig: Column<GQLAction>[] = [
  {
    title: 'Edition',
    key: 'Edition',
    render: (action) => {
      if (action.message?.actionCode?.code === ActionCodes.Mint) {
        return (
          <Link href={`/token/art2/${action.tokenAttributes?.tokenID}`}>
            <span className={cn('link', { link_disabled: !action.tokenAttributes?.supply })}>
              {`${action.tokenAttributes?.supply} of ${action.tokenAttributes?.maximum}`}
            </span>
          </Link>
        );
      }

      if (action.message?.actionCode?.code === ActionCodes.CreateSeries) {
        return 'series';
      }

      if (action.message?.actionCode?.code === ActionType.Create) {
        return '1 of 1';
      }

      return '';
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

export interface Loading {
  mintToken: boolean;
  mintedToken: boolean;
}
