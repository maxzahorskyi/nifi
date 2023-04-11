import { gql } from '@apollo/client';
import { endorsementFragment } from '../fragments/endorsement';

export const getEndorsement = gql`
  query ($query: EndorsementQueryInput) {
    endorsement(query: $query) {
      ...EndorsementFragment
    }
  }
  ${endorsementFragment}
`;

export const getEndorsements = gql`
  query ($query: EndorsementQueryInput) {
    endorsements(query: $query) {
      ...EndorsementFragment
    }
  }
  ${endorsementFragment}
`;
