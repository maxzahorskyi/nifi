import React, { useState } from 'react';
import Card from '../Card';
import DescriptionUtil from '../../../../../utils/DescriptionUtil';
import { GQLSeries } from '../../../../../types/graphql.schema';
import getMediaUrl from '../../../../../utils/getMediaUrl';
import { useUser } from '../../../../../hooks/users';

const CollectionCard = ({ oneSeries, isDesign, user }: Props) => {
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [isVideoModal, setVideoModal] = useState(false);
  const { description, media, title } = oneSeries?.raw || {};
  const firstImage = media?.[0];
  // const firstVideo = videos?.[0]
  const image = getMediaUrl(firstImage?.hash || '', 'image', { width: 600 });

  return (
    <Card
      header={null}
      isDesign={isDesign}
      setToken={() => {}}
      image={{
        url: image,
        isLoaded: isImageLoaded,
        setIsLoaded: setIsImageLoaded,
      }}
      cardName={title}
      videoModal={isVideoModal}
      setVideoModal={setVideoModal}
      cardSubName={DescriptionUtil.shorten(description)}
      currentEdition={+(oneSeries.deployed?.supply || 0)}
      totalEdition={+(oneSeries.deployed?.maximum || 0)}
      editionPrefix="Minted"
      hash={firstImage?.hash}
      token={oneSeries}
      user={user}
    />
  );
};

export default CollectionCard;

interface Props {
  isDesign: boolean;
  user: any;
  oneSeries: GQLSeries;
}
