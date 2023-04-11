import { gql } from '@apollo/client';
import { actionFragment } from '../fragments/action';

export const getActions = gql`
  query ($query: ActionQueryInput, $limit: Int = 100) {
    actions(query: $query, limit: $limit) {
      ...ActionFragment
    }
  }
  ${actionFragment}
`;

export const getActionsByTokenAddress = gql`
  query ($tokenId: String) {
    actions(query: { message: { senderAddress: $tokenId } }) {
      ...ActionFragment
    }
  }
  ${actionFragment}
`;

export const getActionsWithPagination = gql`
  query ($limit: Float = 10, $skip: Float = 0) {
    paginationAction(input: { limit: $limit, skip: $skip }) {
      ...ActionFragment
    }
  }
  ${actionFragment}
`;

export const getActionCount = gql`
  query {
    actionCount
  }
`;
