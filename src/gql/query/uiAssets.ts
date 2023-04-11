import { gql } from '@apollo/client';
import { uiManagementFragment } from '../fragments/uiManagement';
import { uiAsset } from '../fragments/uiAsset';

export const getUiAssets = gql`
  query {
    ui_assets {
      ...UiAsset
    }
  }
  ${uiAsset}
`;
