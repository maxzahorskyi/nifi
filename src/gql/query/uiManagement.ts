import { gql } from '@apollo/client';
import { uiManagementFragment } from '../fragments/uiManagement';

export const getUiManagement = gql`
  query ($query: Ui_managementQueryInput) {
    ui_managements(query: $query) {
      ...UiManagementFragment
    }
  }
  ${uiManagementFragment}
`;
