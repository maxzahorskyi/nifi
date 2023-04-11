import { gql } from '@apollo/client';

export const swiftCodeFragment = gql`
  fragment Swift_codeFragment on Swift_code {
    _id
    actionCapture
    actorField
    additionalInfo
    applicableContractType
    code
    description
  }
`;
