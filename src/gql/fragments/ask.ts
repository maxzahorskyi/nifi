import { gql } from '@apollo/client';

export const askFragment = gql`
  fragment AskFragment on Ask {
    _id
    askID
    deployed {
      askAddress
      askCreator
      currentAskValue
      endTime
      showcaseFee
      status
      superType
      tokenAddress
      tokenID
      values {
        askTime
        askValue
      }
    }
    raw {
      askCreator
      currentAskValue
      endTime
      showcaseFee
      superType
      tokenAddress
      tokenID
      values {
        askTime
        askValue
      }
    }
  }
`;
