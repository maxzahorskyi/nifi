import { gql } from '@apollo/client';

export const uiModule = gql`
  fragment UiModule on Ui_module {
    _id
    autoFinish
    autoStart
    buttonAction
    buttonLink
    buttonName
    buttonType
    comment
    itemType
    mainLink
    managementIDs
    mode
    moduleID
    name
    page
    scope
    specialFeature
    status
    timerVisible
  }
`;
