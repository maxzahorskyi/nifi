import { gql } from '@apollo/client';

export const userFragment = gql`
  fragment UserFragment on User {
    _id
    about
    accountNumber
    avatarHash
    createdAt
    integrations {
      name
      priority
      shadowAddresses
    }
    managingAccount
    mergedAccounts {
      accountNumber
      status
    }
    nickname
    photoHash
    qualification
    username
    walletAddress
    wallpaperHash
    registeredWallet
    defaultWallet
  }
`;
