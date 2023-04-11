import { gql } from '@apollo/client';
import { swiftCodeFragment } from '../fragments/swift_code';

export const getSwiftCodes = gql`
  query ($query: Swift_codeQueryInput) {
    swift_codes(query: $query) {
      ...Swift_codeFragment
    }
  }
  ${swiftCodeFragment}
`;
