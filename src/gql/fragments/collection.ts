import { gql } from '@apollo/client';

export const collectionFragment = gql`
  fragment CollectionFragment on Collection {
    _id
    createdAt
    collectionID
    raw {
      blockchain
      creator
      superType
      privacy
      about
      title
      type
      media {
        role
        hash
        height
        mimetype
        subtitle
        weight
        width
      }
    }
    deployed {
      address
      blockchain
      creator
      type
      superType
    }
  }
`;
