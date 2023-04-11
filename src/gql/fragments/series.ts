import { gql } from '@apollo/client';

export const seriesFragment = gql`
  fragment SeriesFragment on Series {
    raw {
      description
      hash
      collectionID
      media {
        hash
        height
        mimetype
        subtitle
        weight
        width
      }

      numberOfEditions
      superType
      title
      type
      collectionID
    }
    deployed {
      address
      creator
      creatorFees
      hash
      maximum
      superType
      supply
      type
      blockchain
    }
    createdAt
    seriesID
    updatedAt
    _id
  }
`;
