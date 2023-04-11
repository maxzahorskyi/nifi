import React, { useEffect, useState } from 'react';
import { TokenType } from '../../TokenService';
import classes from './index.module.scss';
import Button, { ButtonType } from '../../../../components/Button';
import TokenCard from '../../pages/TokensPage/TokenCard';
import { Result } from 'antd';
import { IToken } from '../../../../types/Tokens/Token';
import getMediaUrl from '../../../../utils/getMediaUrl';
import useAuthContext from '../../../../hooks/useAuthContext';
import { useLikes } from '../../../../hooks/likes/likes';
import Loader from '../../../../components/Loader';
import MasonryWrapper from '../../pages/TokensPage/MasonryWrapper';

const Tokens = ({ tokens, users, clearFilters, isLoading, isDesign, isTokensLoading }: Props) => {
  const isAllTokensFiltered = Boolean(tokens?.length);
  const { user } = useAuthContext();
  const { getGroupLikes } = useLikes();

  const [likesData, setLikesData] = useState<any | undefined>();

  const preloadImages = () => {
    if (!tokens) return;

    tokens.forEach((token) => {
      const lastTokenObject = token?.raw?.media?.slice(-1).pop();
      const hash = lastTokenObject?.hash;
      const videoType = lastTokenObject?.mimetype?.includes('video');

      if (hash) {
        new Image().src = getMediaUrl(hash, videoType ? 'video' : 'image');
      }
    });
  };

  useEffect(() => {
    if (isTokensLoading || isLoading || !tokens || user === undefined) return;
    getGroupLikes({
      tokens,
      userAccountNumber: user?.accountNumber,
      onSuccess: (data: any) => setLikesData(data),
    });
    // preloadImages()
  }, [isTokensLoading, user]);

  if (isLoading) return <Loader text="Tokens are being loaded" />;

  if (!tokens?.length) {
    return (
      <Result
        title={
          isAllTokensFiltered
            ? 'There are no tokens matching your request'
            : 'There are no tokens yet'
        }
        extra={
          isAllTokensFiltered && (
            <div className={classes.centered} onClick={clearFilters}>
              <Button styleType={ButtonType.Primary}>View all</Button>
            </div>
          )
        }
      />
    );
  }

  return (
    <MasonryWrapper theme={isDesign}>
      {tokens.map((token, key) => {
        const tokenID =
          token?.deployed?.type === TokenType.Art2
            ? token.deployed?.seriesID?.seriesID
            : token.tokenID;
        const user = users?.find(
          (user: any) => (user?.walletAddress || user) === token?.raw?.creator,
        );
        return (
          <div key={key}>
            <TokenCard
              isDesign={isDesign}
              token={token}
              user={user}
              likeData={likesData && tokenID ? likesData[tokenID] : undefined}
            />
          </div>
        );
      })}
    </MasonryWrapper>
  );
};

export default Tokens;

interface Props {
  tokens: IToken[] | undefined;
  users?: any | undefined;
  clearFilters: () => void;
  isLoading?: boolean;
  isDesign: boolean;
  isTokensLoading?: boolean;
}
