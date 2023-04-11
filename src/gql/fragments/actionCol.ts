import { gql } from '@apollo/client';

export const actionColFragment = gql`
  fragment ActionColFragment on ActionCol {
    _id
    actionAttributes {
      actionCapture
    }
    message {
      actionCode
      hash
      senderAddress
      senderID
      superType
      time
    }
    tokenAttributes {
      seriesCreator
      seriesID
      tokenID
    }
  }
`;
