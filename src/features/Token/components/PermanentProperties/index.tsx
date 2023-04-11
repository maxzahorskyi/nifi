/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
import React, { useMemo, useState } from 'react';
import classes from './index.module.scss';
import LinkList from '../../../../components/LinkList';
import TextList from '../../../../components/TextList';
import TextButton from '../../../../components/TextButton';
import Properties from '../../../../components/Properties';
import { TokenType } from '../../TokenService';
import getMediaUrl from '../../../../utils/getMediaUrl';
import { message, Skeleton } from 'antd';
import UserLink from '../../../../components/UserLink';
import Link from 'next/link';
import { ITokenInfoDto } from '../../../../types/Tokens/TokenInfo';
import { GQLCollection, GQLSeries, GQLUser } from '../../../../types/graphql.schema';
import parseTokenId from '../../../../utils/TokenUtil';
import getConfig from 'next/config';
import { useCollection } from '../../../../hooks/collections';
import { ApolloError } from '@apollo/client';
import PermanentPropertiesModals from '../../../../components/PermanentPropertiesModals';
import { TokenSaleType } from '../../../../types/Tokens/Token';
import useContractsContext from '../../../../hooks/useContractsContext';
import cn from 'classnames';
import { toFormatWalletAddress } from '../../../../utils/toFormatWalletAddress';
import useAuthContext from '../../../../hooks/useAuthContext';
import useWindowDimensions from '../../../../hooks/useWindowDimensions';
import { useNetworkError } from '../../../../hooks/useNetworkError';

const { bcExplorer } = getConfig().publicRuntimeConfig;

const PermanentProperties = ({
  creator,
  getTokenUserNickname,
  onSendToken,
  canSendToken,
  token,
  series,
  stamp,
  ownToken,
  setEndorse,
  isEndorseOpen,
  foreverTokensNumber,
  seal,
  saleType,
  isAcceptOpen,
  setIsAcceptOpen,
}: Props) => {
  const { onNetworkErrorClick } = useNetworkError();
  const mintedTokenOrSeries = token ?? series;
  const { width, maxMobileWidth } = useWindowDimensions();
  const { description, collectionID } = mintedTokenOrSeries?.raw || {};
  const seriesInfo = useMemo(() => {
    return series || token?.deployed?.seriesID;
  }, [series, token]);
  const [collection, setCollection] = useState<GQLCollection | undefined>(undefined);
  const [isDetails, setDetails] = useState<boolean>(false);
  const config = getConfig();
  const imgUrl = config.publicRuntimeConfig.services.mediaUrl;
  const { contractTypes } = useContractsContext();
  const { networkError } = useAuthContext();
  useCollection({
    skipQuery: false,
    variables: { query: { collectionID } },
    onSuccess: (collection: GQLCollection) => {
      setCollection(collection);
    },
    onError: (e: ApolloError) => {
      console.log(e);
    },
  });
  const collectionImg = collection?.media?.find(({ role }: any) => role === 'avatar');
  let userId = creator?.username ?? creator?.accountNumber;
  userId =
    userId ?? mintedTokenOrSeries?.deployed?.creator ?? mintedTokenOrSeries?.deployed?.creator;
  return (
    <Properties
      className={classes.permanentProperties}
      items={[
        {
          label: 'Blockchain',
          value: (
            <div className={classes.blockchain}>
              <span>
                {mintedTokenOrSeries?.raw?.blockchain === 'binance' ? (
                  <img
                    src="/icons/binanceSign.svg"
                    alt="everscale sign"
                    width="32px"
                    height="32px"
                  />
                ) : (
                  <img
                    src="/icons/everscaleSign.svg"
                    alt="everscale sign"
                    width="30px"
                    height="30px"
                    className={classes.imgClassName}
                  />
                )}
                {mintedTokenOrSeries?.raw?.blockchain === 'binance' ? 'Binance' : 'Everscale'}
              </span>
              {saleType &&
                [TokenSaleType.Pending, TokenSaleType.Endorsement, TokenSaleType.Offer].includes(
                  saleType,
                ) && (
                  <PermanentPropertiesModals
                    token={token}
                    isAcceptOpen={isAcceptOpen}
                    setIsAcceptOpen={setIsAcceptOpen}
                    isAccept
                    blockchain={mintedTokenOrSeries?.raw?.blockchain}
                  />
                )}
            </div>
          ),
        },
        {
          label: 'Type',
          value: (
            <div className={classes.charge}>
              {
                contractTypes?.find(
                  (item) => item.longType === `nifi.${mintedTokenOrSeries?.deployed?.type}`,
                )?.frontendName
              }
              {token?.raw?.type === TokenType.Seal ? (
                <></>
              ) : (
                saleType &&
                [TokenSaleType.Pending, TokenSaleType.Endorsement, TokenSaleType.Offer].includes(
                  saleType,
                ) && (
                  <PermanentPropertiesModals
                    token={token}
                    setEndorse={setEndorse}
                    isEndorseOpen={isEndorseOpen}
                    blockchain={mintedTokenOrSeries?.raw?.blockchain}
                  />
                )
              )}
            </div>
          ),
        },
        {
          label: 'Creator',
          value: (
            <div className={classes.creator}>
              <UserLink userId={userId}>
                {creator?.avatarHash ? (
                  <img
                    className={classes.avatar}
                    alt="creator avatar"
                    src={getMediaUrl(creator.avatarHash, 'image', {
                      width: 80,
                      height: 80,
                      compressionQuality: 70,
                    })}
                    width={80}
                    height={80}
                  />
                ) : (
                  <Skeleton.Avatar size={80} />
                )}

                <span className={classes.creator__name}>{getTokenUserNickname('creator')}</span>
              </UserLink>

              {canSendToken && (
                <LinkList
                  items={[
                    <span onClick={!networkError ? onSendToken : onNetworkErrorClick}>
                      Send token
                    </span>,
                  ]}
                  getItemTitle={(item) => item}
                  getIsActive={() => true}
                />
              )}
            </div>
          ),
        },
        {
          label: 'Collection',
          value: (
            <div className={classes.collection}>
              {collectionID && collectionImg ? (
                <a href={`/collection/${collectionID}`}>
                  <div className={cn(classes.collection_link, 'link')}>
                    <img
                      src={`${imgUrl}/${collectionImg.hash}`}
                      alt=""
                      className={classes.collection_image}
                    />
                    <span className={classes.collection__collectionName}>{collection?.title}</span>
                  </div>
                </a>
              ) : (
                <>
                  <Skeleton.Avatar size={80} style={{ borderRadius: 16 }} />
                  <span className={classes.collection__collectionName}>No collection</span>
                </>
              )}
            </div>
          ),
          required: true,
        },
        token?.deployed?.seal &&
          seal && {
            label: 'Endorsement',
            value: (
              <div className={classes.endorseRow}>
                <a href={`/token/seal/${token?.deployed?.seal}`}>
                  <div className={cn(classes.seal, classes.collection_link, 'link')}>
                    <img src={`${imgUrl}/${seal?.raw?.media[0]?.hash}`} alt="" />
                    <div className={classes.seal_link}>
                      {toFormatWalletAddress(token?.deployed?.seal, 8)}
                    </div>
                  </div>
                </a>
                <div className={classes.angle}>{token?.deployed?.sealPosition}</div>
              </div>
            ),
          },
        token && {
          label: 'Edition',
          value: `${
            token?.deployed?.type === TokenType.Art2
              ? parseTokenId(token.tokenID as string).tokenId
              : 1
          } of ${
            token?.deployed?.type === TokenType.Art2
              ? token?.deployed?.seriesID?.deployed?.maximum
              : 1
          }`,
        },
        seriesInfo &&
          mintedTokenOrSeries?.deployed?.type === TokenType.Art2 && {
            label: 'Tokens minted',
            value: (
              <div className={classes.toSeries}>
                <div>
                  {seriesInfo?.deployed?.supply} of {seriesInfo?.deployed?.maximum}
                </div>

                {token?.deployed?.type === TokenType.Art2 && (
                  <LinkList
                    items={[
                      <Link href={`/token/art2/${seriesInfo?.seriesID}/series`}>
                        <span>Go to series</span>
                      </Link>,
                    ]}
                    getItemTitle={(item) => item}
                    getIsActive={() => true}
                  />
                )}
              </div>
            ),
          },
        token?.deployed?.foreverID && {
          label: '4ever',
          value: (
            <a href={`/token/for1/${token?.deployed?.foreverID}`}>
              <div className={classes.endorseLink}>
                {toFormatWalletAddress(token?.deployed?.foreverID, 8)}
              </div>
            </a>
          ),
        },
        {
          label: width > maxMobileWidth && <div className={classes.line_left} />,
          value: (
            <div className={classes.buttonWrapper}>
              <div className={classes.line} />
              <div className={classes.text} onClick={() => setDetails(!isDetails)}>
                {isDetails ? 'less' : 'more'}
              </div>
            </div>
          ),
        },

        isDetails && {
          label: <span style={{ alignSelf: 'flex-start', marginTop: -40 }}>Description</span>,
          value: description,
        },
        isDetails && {
          label: <span style={{ alignSelf: 'flex-start' }}>Details</span>,
          value: (
            <TextList
              items={[
                !foreverTokensNumber &&
                  `${stamp ? 1 : mintedTokenOrSeries?.raw?.media?.length ?? 0}-piece artefact`,
                foreverTokensNumber && !stamp && `${foreverTokensNumber}-token set`,
                stamp &&
                  `format: ${mintedTokenOrSeries?.raw?.media?.[0]?.height} x ${mintedTokenOrSeries?.raw?.media?.[0]?.width} px`,
                `lifelong creator's fee: ${
                  +(mintedTokenOrSeries?.deployed?.creatorFees || '0') / 100
                }%`,
                <>
                  contract ID
                  <span style={{ color: '#e4456c' }}>
                    {' '}
                    {toFormatWalletAddress(token ? token?.tokenID : series?.seriesID, 8, true)}{' '}
                  </span>
                  <img
                    className={classes.endorseLink}
                    src="/icons/copyIcon.svg"
                    height="17px"
                    width="17px"
                    alt="copyIcon"
                    onClick={() => {
                      navigator.clipboard.writeText(`${token ? token?.tokenID : series?.seriesID}`);
                      message.success('Copied');
                    }}
                  />
                </>,
                <>
                  contract address
                  <span style={{ color: '#e4456c' }}>
                    {' '}
                    {toFormatWalletAddress(mintedTokenOrSeries?.deployed?.address)}{' '}
                  </span>
                  <img
                    className={classes.endorseLink}
                    src="/icons/copyIcon.svg"
                    height="17px"
                    width="17px"
                    alt=""
                    onClick={() => {
                      navigator.clipboard.writeText(`${mintedTokenOrSeries?.deployed?.address}`);
                      message.success('Copied');
                    }}
                  />
                </>,
                <>
                  This is a signed and limited edition digital creation.
                  <a
                    href={`https://${bcExplorer}/accounts/accountDetails?id=${mintedTokenOrSeries?.deployed?.address}`}
                    target="_blank"
                    rel="noreferrer">
                    <TextButton>See in blockchain browser</TextButton>
                  </a>
                </>,
              ]}
              getItemTitle={(title) => <span>• {title}</span>}
              className={classes.meta}
              itemClassName={classes.meta__item}
              ownToken={ownToken}
            />
          ),
        },
      ]}
      renderItemLabel={(item) => item && item?.label}
      renderItemValue={(item) => item && item?.value}
      labelProps={{
        className: classes.permanentProperties__label,
      }}
      valueProps={{
        className: classes.permanentProperties__value,
      }}
    />
  );
};

export default PermanentProperties;

interface Props {
  creator: GQLUser | undefined;
  getTokenUserNickname: (userType: 'owner' | 'creator') => string | undefined;
  canSendToken?: boolean | undefined;
  foreverTokensNumber?: number | undefined;
  onSendToken?: () => void;
  token?: ITokenInfoDto;
  series?: GQLSeries;
  type: TokenType;
  stamp?: boolean;
  seal?: any;
  ownToken?: boolean;
  saleType?: TokenSaleType;
  setEndorse?: (v: boolean, result?: 'request' | 'cancel' | 'forever') => void;
  isEndorseOpen?: boolean;
  isAcceptOpen?: boolean;
  setIsAcceptOpen?: (_: boolean) => void;
}
