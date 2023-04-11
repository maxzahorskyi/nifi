import { useState, useEffect } from 'react';
import { AuthLocalStorage } from '../auth/AuthLocalStorage';
import { GQLIntegration, GQLUser } from '../types/graphql.schema';
import { walletTypes } from '../types/wallet';
import { useUser } from './users';

export interface Wallet {
  hasProvider: boolean;
  name: walletTypes;
  title: string | undefined;
  address: string | undefined;
  blockchain: string;
  status: string;
}

const useGetUser = (
  walletType: walletTypes | undefined,
  wallets: { [key in walletTypes]?: Wallet },
  walletAddress: string,
  integrations: GQLIntegration[] | undefined,
  isAuth: any,
) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<GQLUser | undefined>();

  const { error, loading, fetchMore } = useUser({
    skipQuery: !walletAddress,
    variables: { query: { walletAddress } },
    onSuccess: (data) => {
      if (data?.user && data?.user?.walletAddress) {
        const auth = new AuthLocalStorage();
        isAuth = auth.getTokenByWalletAddress(data?.user?.walletAddress);

        if (isAuth) {
          setUser({
            ...data?.user,
            registeredWallet:
              integrations?.find((item) => item.code === data?.user?.registeredWallet)?.name || '-',
          });
          setIsAuthenticated(true);
        }
      } else if (walletAddress) {
        setUser({ walletAddress });
        setIsAuthenticated(false);
      } else {
        setUser(undefined);
        setIsAuthenticated(false);
      }
    },
    onError: (e) => console.log(e),
  });

  useEffect(() => {
    if (!walletAddress) {
      setUser(undefined);
      setIsAuthenticated(false);
    }

    if (walletAddress === '') {
      setUser({});
      setIsAuthenticated(false);
    }
  }, [walletAddress]);

  useEffect(() => {
    if (walletAddress && !isAuth) {
      setUser(undefined);
      setIsAuthenticated(false);
    }
  }, [isAuth, walletAddress]);

  return {
    isAuthenticated,
    setIsAuthenticated,
    user,
    fetchUser: fetchMore,
    setUser,
    isFetching: loading,
    error,
    walletAddress,
    wallets,
  };
};

export default useGetUser;
