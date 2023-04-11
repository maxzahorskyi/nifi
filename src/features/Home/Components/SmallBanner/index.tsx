import React from 'react';
import classes from './index.module.scss';
import getCorrectImageUrl from '../../../../utils/GetCorrectImageUrlUtil';
import { GQLUi_asset as GQLUiAsset } from '../../../../types/graphql.schema';
import Link from 'next/link';

const SmallBanner = ({
  banner: { image, assetTitle, assetSubtitle, textLanding, imageLanding, assetID },
}: Props) => {
  return (
    <div className={classes.container} key={assetID}>
      <Link href={imageLanding || '/help'}>
        <a
          className={classes.imageContainer}
          style={{ backgroundImage: `url(${getCorrectImageUrl(image)})` }}>
          {' '}
        </a>
      </Link>
      <Link href={textLanding || '/help'}>
        <a className={classes.text}>
          <div className={classes.title}>{assetTitle}</div>
          <div className={classes.desc}>{assetSubtitle}</div>
        </a>
      </Link>
    </div>
  );
};

interface Props {
  banner: GQLUiAsset;
}

export default SmallBanner;
