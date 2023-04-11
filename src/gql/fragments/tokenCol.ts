import { gql } from '@apollo/client';

export const tokenColFragment = gql`
  fragment TokenColFragment on TokenCol {
    _id
    address
    images {
      hash
      height
      mimetype
      rarity
      subtitle
      weight
      width
    }
    merged
    seriesId
    tokenId
  }
`;
