import { ApolloError } from '@apollo/client';
import { message } from 'antd';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import UserInfo from '../../../../components/UserInfo';
import { useCollections } from '../../../../hooks/collections';
import { useSeries } from '../../../../hooks/series';
import { useToken } from '../../../../hooks/tokens';
import useAuthContext from '../../../../hooks/useAuthContext';
import useWindowDimensions from '../../../../hooks/useWindowDimensions';
import { GQLCollection } from '../../../../types/graphql.schema';
import { routeMap } from '../../../../types/pages';
import AddressUtil from '../../../../utils/AddressUtil';
import getMediaUrl from '../../../../utils/getMediaUrl';
import CreateTokenForms from '../../components/CreateTokenForms';
import { TokenType } from '../../TokenService';
import classes from './index.module.scss';

const TokenPageCreate = () => {
  const router = useRouter();
  const { width, maxMobileWidth } = useWindowDimensions();
  const { user, walletAddress: wallet, blockchain } = useAuthContext();
  const [collectionArray, setCollectionArray] = useState<GQLCollection[] | undefined>(undefined);

  const routeType = router.route.split('/')?.[router.route.split('/').length - 1];
  const typePage = (routeType && routeMap[routeType]) || TokenType.Art1;
  const [type, setType] = useState<TokenType>(typePage);

  const identifier = router.query?.usernameOrAccountNumber as string | undefined;
  const [createdTokenId, setCreatedTokenId] = useState<string | undefined>(undefined);

  if (blockchain === 'everscale') {
    useCollections({
      skipQuery: !wallet,
      variables: { query: { creator: wallet } },
      onSuccess: (collections: GQLCollection[]) => {
        setCollectionArray(collections);
      },
      onError: (e: ApolloError) => {
        console.log(e);
      },
    });
  } else {
    useCollections({
      skipQuery: !wallet,
      variables: { query: { deployed: { blockchain, superType: `nifi.${type}.1` } } },
      onSuccess: (collections: GQLCollection[]) => {
        setCollectionArray(collections);
      },
      onError: (e: ApolloError) => {
        console.log(e);
      },
    });
  }

  useToken({
    skipQuery: !createdTokenId || type === TokenType.Art2,
    pollInterval: createdTokenId && type !== TokenType.Art2 ? 1000 : undefined,
    variables: {
      query: {
        deployed: {
          creator: user?.walletAddress,
          owner: user?.walletAddress,
        },
        tokenID: createdTokenId,
      },
    },
    onSuccess: (token) => {
      if (token?.tokenID) {
        router.push(`/token/${type}/${token.tokenID}`);
      }
    },
    onError: (e: ApolloError) => {
      console.log(e);
    },
  });

  useSeries({
    skipQuery: !createdTokenId || type !== TokenType.Art2,
    pollInterval: createdTokenId && type === TokenType.Art2 ? 1000 : undefined,
    variables: {
      query: {
        deployed: {
          creator: user?.walletAddress,
        },
        seriesID: createdTokenId,
      },
    },
    onSuccess: (series) => {
      if (series) {
        router.push(`/token/${type}/${series.seriesID}/series`);
      }
    },
    onError: (e: ApolloError) => {
      console.log(e);
    },
  });

  useEffect(() => {
    if (createdTokenId) {
      const timeout = setTimeout(() => {
        setCreatedTokenId(undefined);
        message.error('An error occurred while creating the token');
      }, 15000);
      return () => clearTimeout(timeout);
    }
    return () => {};
  }, [createdTokenId]);

  return (
    <div>
      {width <= maxMobileWidth && (
        <div style={{ margin: '30px 0' }}>
          <UserInfo
            avatarUrl={
              user?.avatarHash &&
              getMediaUrl(user.avatarHash, 'image', {
                width: 80,
                height: 80,
                compressionQuality: 70,
              })
            }
            name={
              <div className="username">
                <span>{user?.nickname ?? AddressUtil.shorten(identifier)}</span>
                {user?.username && <span>@{user?.username}</span>}
              </div>
            }
            className={classes.userInfo}
          />
        </div>
      )}
      <CreateTokenForms
        collectionArray={collectionArray}
        setCreatedTokenId={setCreatedTokenId}
        type={type}
        setType={setType}
      />
    </div>
  );
};

export default TokenPageCreate;
