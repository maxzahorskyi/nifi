import { gql } from '@apollo/client';

export const uiAsset = gql`
  fragment UiAsset on Ui_asset {
    _id
    assetID
    assetSubtitle
    assetTitle
    image
    imageLanding
    managementIDs
    textLanding
  }
`;
