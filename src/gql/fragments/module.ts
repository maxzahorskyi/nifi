import { gql } from '@apollo/client';

export const moduleFragment = gql`
  fragment ModuleFragment on Module {
    _id
    module
    page
    type
  }
`;
