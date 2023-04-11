import React, { useEffect, useState } from 'react';
import classes from './index.module.scss';
import SmallBanner from '../SmallBanner';
import { AssetInterface, ClassifiedInterface } from '../../types';
import { GQLUi_management as GQLUiManagement } from '../../../../types/graphql.schema';

const Classified = ({ classifieds, assets }: Props) => {
  if (!classifieds.length) return <></>;

  const [visibleBanners, setVisibleBanners] = useState<AssetInterface[]>([]);

  useEffect(() => {
    let result: AssetInterface[] = [];
    classifieds.forEach((el) => {
      const finded = assets.find((asset) => asset.MANAGEMENT === el.recordID);
      if (finded) {
        result = [...result, finded];
      }
    });
    setVisibleBanners(result);
  }, [classifieds, assets]);

  return (
    <div className={classes.smallBannersSection}>
      {classifieds.map(
        (banner, index) => banner.assetID && <SmallBanner key={index} banner={banner.assetID} />,
      )}
    </div>
  );
};

interface Props {
  classifieds: GQLUiManagement[];
  assets: AssetInterface[];
}

export default Classified;
