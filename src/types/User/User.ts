import { ObjectID } from 'typeorm';

export interface IUser {
  about: string;
  accountNumber: number;
  avatarHash: string;
  createdAt: number;
  integrations: [IUserIntegration];
  managingAccount: number;
  mergedAccounts: [IUserMergedAccount];
  nickname: string;
  photoHash: string;
  qualification: number;
  username: string;
  walletAddress: string;
  wallpaperHash: string;
}

interface IUserIntegration {
  name: string;
  priority: number;
  shadowAddresses: [string];
}

interface IUserMergedAccount {
  accountNumber: number;
  status: string;
}
