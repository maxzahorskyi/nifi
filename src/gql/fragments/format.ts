import { gql } from '@apollo/client';

export const formatFragment = gql`
  fragment formatFragment on Format {
    _id
    formatName
    width
    height
  }
`;
