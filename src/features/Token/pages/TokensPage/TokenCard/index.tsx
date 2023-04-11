import React, { useEffect, useState } from 'react';
import Card from '../Card';
import TokenUtil from '../../../utils/TokenUtil';
import GetTokenHeader from '../GetTokenHeader';
import { ITokenInfoDto } from '../../../../../types/Tokens/TokenInfo';
import parseTokenId from '../../../../../utils/TokenUtil';
import getMediaUrl from '../../../../../utils/getMediaUrl';
import WhiteVideoIcon from '../../../../../../public/icons/whiteVideoIcon.svg';
import { TokenSaleType } from '../../../../../types/Tokens/Token';
import { TokenType } from '../../../TokenService';
import { IUser } from '../../../../../types/User/User';
import { likesData } from '../../../../../hooks/likes/likes';
import { FrontStatus, useFrontStatus } from '../../../../../hooks/status/useFrontStatus';

const TokenCard = ({ token, isDesign, likeData, user }: Props) => {
  const { getFrontStatus } = useFrontStatus();
  const [iToken, setToken] = useState<ITokenInfoDto | undefined>(undefined);
  useEffect(() => setToken(token), [token]);

  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [isVideoModal, setVideoModal] = useState(false);
  const { description, media, title } = token?.raw || {};

  const {
    bestPrice,
    saleType,
    isExpired,
    endTime,
    currentPrice,
    numberOfCustomers,
    endOfferTime,
    step,
  } = TokenUtil.getSaleInfo({
    auction: token.auction,
    bids: token.bids,
    ask: token.ask,
    isAddedToForever: !!token.deployed?.foreverID,
    endorsement: token.endorsement,
  });

  const Image = media?.[0]?.hash;
  const Video = media?.find(({ mimetype }: any) => mimetype.includes('video'))?.hash;
  const frontStatus = getFrontStatus(token?.deployed?.frontStatus);

  const image = getMediaUrl(Video ? Video : Image || '', Video ? 'video/preview' : 'image', {
    width: 300,
    compressionQuality: 70,
  });

  const closeVideoPreview = (value: any) => {
    setVideoModal(value);
  };

  const style = {
    position: 'absolute',
    right: '24px',
    bottom: !isDesign ? '74px' : '24px',
    zIndex: !isDesign ? 1 : 0,
    opacity: isVideoModal ? 0 : 1,
  };

  const onClick = (e: any) => {
    e.stopPropagation();
    e.preventDefault();
    setVideoModal(true);
  };

  return (
    <div style={{ position: 'relative' }}>
      {Video && <WhiteVideoIcon style={style} onClick={onClick} />}
      {iToken && (
        <Card
          header={
            <GetTokenHeader
              currentPrice={saleType === TokenSaleType.Ask ? bestPrice : currentPrice}
              numberOfCustomers={numberOfCustomers}
              saleType={saleType}
              minimalBid={step}
              isDesign={isDesign}
              frontStatus={frontStatus}
            />
          }
          image={{
            url: image,
            isLoaded: isImageLoaded,
            setIsLoaded: setIsImageLoaded,
          }}
          cardName={title}
          cardSubName={description}
          currentEdition={
            iToken?.deployed?.type === TokenType.Art2
              ? parseTokenId(iToken?.tokenID || '').tokenId
              : 1
          }
          totalEdition={
            iToken?.deployed?.type === TokenType.Art2
              ? iToken?.deployed?.seriesID?.deployed?.maximum
              : 1
          }
          hash={Video ? Video : Image}
          token={iToken}
          user={user}
          setToken={setToken}
          saleType={saleType}
          videoModal={isVideoModal}
          setVideoModal={setVideoModal}
          isDesign={isDesign}
          closeVideoModal={closeVideoPreview}
          askPrice={currentPrice}
          likeData={likeData}
          timeTagProps={{
            isExpired,
            endTime,
            endOfferTime,
            currentPrice,
            isClosed: frontStatus === FrontStatus.ACCEPTING_BIDS && !numberOfCustomers,
          }}
          frontStatus={frontStatus}
        />
      )}
    </div>
  );
};

export default TokenCard;

interface Props {
  token: ITokenInfoDto;
  isDesign: boolean;
  setToken?: (data: any) => void;
  likeData?: likesData;
  user?: IUser | string;
}
