import { gql } from '@apollo/client';
import { uiAsset } from './uiAsset';
import { uiModule } from './uiModule';

export const uiManagementFragment = gql`
  fragment UiManagementFragment on Ui_management {
    _id
    assetTitle
    assetID {
      ...UiAsset
    }
    image
    itemID
    itemLink
    moduleID {
      ...UiModule
    }
    tag
    moduleItemType
    moduleName
    moduleScope
    recordID
    visibilityStatus
  }
  ${uiAsset}
  ${uiModule}
`;
