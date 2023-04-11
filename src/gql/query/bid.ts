import { gql } from '@apollo/client';
import { offerFragment } from '../fragments/offer';

export const getBids = gql`
  query ($query: BidQueryInput) {
    bids(query: $query) {
      ...OfferFragment
    }
  }
  ${offerFragment}
`;

// export const getBid = gql`
//   query ($id: String, $tokenID: String) {
//     bid(query: { deployed: { bidID: $id, tokenID: $tokenID } }) {
//       ...OfferFragment
//     }
//   }
//   ${offerFragment}
// `

export const getBid = gql`
  query ($query: BidQueryInput) {
    bid(query: $query) {
      ...OfferFragment
    }
  }
  ${offerFragment}
`;

export const addBid = gql`
  mutation ($data: BidRawInsertInput!) {
    insertOneBid(data: { raw: $data }) {
      _id
    }
  }
`;
