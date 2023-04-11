import { gql } from '@apollo/client';
import { userFragment } from './user';
import { seriesFragment } from './series';

export const tokenFragment = gql`
  fragment TokenFragment on Token {
    _id
    createdAt
    tokenID
    deployed {
      address
      creator
      creatorObject {
        ...UserFragment
      }
      creatorFees
      frontStatus
      hash
      owner
      ownerObject {
        ...UserFragment
      }
      seriesID {
        ...SeriesFragment
      }
      superType
      seal
      foreverID
      sealPosition
      type
      stamps {
        tokenID
      }
    }
    raw {
      creator
      description
      hash
      media {
        role
        hash
        height
        mimetype
        subtitle
        weight
        width
      }
      superType
      title
      type
      owner
      collectionID
      qualification
      blockchain
    }
    updatedAt
  }
  ${userFragment}
  ${seriesFragment}
`;
