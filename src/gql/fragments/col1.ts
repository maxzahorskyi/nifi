import { gql } from '@apollo/client';

export const col1Fragment = gql`
  fragment Col1Fragment on Col1 {
    _id
    address
    hash
    layers {
      images {
        hash
        height
        mimetype
        rarity
        subtitle
        weight
        width
      }
      layer
      points {
        hash
        point
      }
    }
    mintCost
    creator
    description
    maximum
    name
    seriesId
  }
`;
