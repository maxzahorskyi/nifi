import { gql } from '@apollo/client';

export const offerFragment = gql`
  fragment OfferFragment on Bid {
    _id
    createdAt
    bidID
    deployed {
      bidAddress
      bidValue
      bidCreator
      endTime
      status
      superType
      tokenAddress
      tokenID
    }
    raw {
      bidCreator
      bidValue
      endTime
      superType
      tokenAddress
      tokenID
    }
    updatedAt
  }
`;
