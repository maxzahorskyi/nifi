import { gql } from '@apollo/client';

export const auctionFragment = gql`
  fragment AuctionFragment on Auction {
    _id
    createdAt
    auctionID
    deployed {
      auctionAddress
      bidStep
      bids {
        bidCreator
        bidStatus
        bidValue
      }
      endTime
      finalBid
      startBid
      startTime
      status
      superType
      tokenAddress
      tokenID
    }
    raw {
      auctionCreator
      endTime
      showcaseFee
      startBid
      startTime
      superType
      tokenAddress
      tokenID
    }
    updatedAt
  }
`;
