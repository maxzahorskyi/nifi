import { gql } from '@apollo/client';
import { actionColFragment } from '../fragments/actionCol';

export const getActionCols = gql`
  query ($query: ActionColQueryInput) {
    actionCols(query: $query) {
      ...ActionColFragment
    }
  }
  ${actionColFragment}
`;

export const getActionCol = gql`
  query ($query: ActionColQueryInput) {
    actionCol(query: $query) {
      ...ActionColFragment
    }
  }
  ${actionColFragment}
`;
