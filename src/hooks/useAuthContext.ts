import { useContext } from 'react';
import { AuthContext } from '../features/app';
import { UserDto } from '../features/User/UserService';
import { GQLUi_management as GQLUiManagement, GQLUser } from '../types/graphql.schema';
import { walletTypes } from '../types/wallet';
import { Wallet } from './useGetUser';
import { likesData } from './likes/likes';

const useAuthContext = () => {
  const contextValue: AuthContextValue = useContext(AuthContext);

  return contextValue;
};

export default useAuthContext;

interface AuthContextValue {
  isAuthenticated: boolean;
  setIsAuthenticated: (value: boolean) => void;
  fetchUser: () => void;
  setUser: (user: GQLUser) => void;
  user: UserDto;
  isFetching: boolean;
  walletAddress: string | undefined;
  setWalletAddress?: (s: string) => void;
  setWalletType: (v: walletTypes | undefined) => void;
  tsWallets: string[] | undefined;
  setSession: (s: string) => void;
  session: string | undefined;
  wallets:
    | {
        [key: string]: Wallet;
      }
    | undefined;
  type: walletTypes | undefined;
  tsWallet: string | undefined;
  setTsWallet: (s: string | undefined) => void;
  setHashes: (s: string[]) => void;
  setUpdateSession: (e: boolean) => void;
  hashes?: string;
  networkError?: boolean;
  blockchain: 'everscale' | 'binance' | undefined;
  setBlockchain: (s: string) => void;
  likesCollectionData?: { [key: string]: likesData } | undefined;
  setLikesCollectionData?: (a: { [key: string]: likesData } | undefined) => void;
}
