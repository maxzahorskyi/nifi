import { gql } from '@apollo/client';
import { auctionFragment } from '../fragments/auction';

export const getAuctions = gql`
  query ($query: AuctionQueryInput) {
    auctions(query: $query) {
      ...AuctionFragment
    }
  }
  ${auctionFragment}
`;

export const getAuction = gql`
  query ($query: AuctionQueryInput) {
    auction(query: $query) {
      ...AuctionFragment
    }
  }
  ${auctionFragment}
`;

export const addAuction = gql`
  mutation ($auction: AuctionRawInsertInput!) {
    insertOneAuction(data: { raw: $auction }) {
      _id
    }
  }
`;
