import { gql } from '@apollo/client';

export const endorsementFragment = gql`
  fragment EndorsementFragment on Endorsement {
    _id
    createdAt
    deployed {
      corner
      creator
      sealID
      status
      tokenID
      value
      expiresAt
      type
    }
    raw {
      cornerNE
      cornerNW
      cornerSE
      cornerSW
      creator
      sealID
      tokenID
      value
      superType
    }
    endorsementID
    updatedAt
  }
`;
