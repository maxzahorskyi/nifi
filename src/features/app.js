import React, { useEffect, useMemo, useState } from 'react';
import 'antd/dist/antd.css';
import TonClientBridge from '../config/ton/Extraton';
import useGetUser from '../hooks/useGetUser';
import cn from 'classnames';
import classes from '../pages/_app.module.scss';
import Header from '../components/Header';
import Container from '../components/Container';
import Footer from '../components/Footer';
import { useQuery as useGqlQuery } from '@apollo/client';
import { getCommissions } from '../gql/query/commission';
import useWindowDimensions from '../hooks/useWindowDimensions';
import MobileUnderMenu from '../components/MobileUnderMenu';
import EverWallet from '../config/ton/EverWallet';
import { getIntegrations } from '../gql/query/integration';
import Cookies from 'universal-cookie';
import EverSurf from '../config/ton/EverSurf';
import { walletTypes } from '../types/wallet';
import useGetContracts from '../hooks/useGetContracts';
import getConfig from 'next/config';
import { getNetworks } from '../gql/query/network';
import { message } from 'antd';
import DataContextProvider from '../contexts/DataContextProvider';
import { Auth } from '../auth/Auth';
import MetaMask from '../config/binance/Metamask';
import { AuthLocalStorage } from '../auth/AuthLocalStorage';

message.config({ maxCount: 1 });

const cookies = new Cookies();

const authContextValue = {
  isAuthenticated: false,
  setIsAuthenticated: () => {},
  user: {
    id: '',
    avatarHash: '',
    nickname: '',
    walletAddress: '',
    username: '',
    accountNumber: 0,
    registeredWallet: walletTypes.ET,
    defaultWallet: walletTypes.ET,
    hashes: '',
  },
  tsWallets: undefined,
  setSession: () => {},
  session: undefined,
  tsWallet: undefined,
  setTsWallet: () => {},
  fetchUser: () => {},
  setUser: (user) => {},
  isFetching: true,
  walletAddress: undefined,
  setWalletAddress: () => {},
  type: undefined,
  setWalletType: () => {},
  blockchain: undefined,
  setBlockchain: () => {},
  setUpdateSession: () => {},
  setHashes: () => {},
  wallets: undefined,
  networkError: false,

  likesCollectionData: undefined,
  setLikesCollectionData: () => {},
};

const contractContextValue = {
  contracts: undefined,
  isFetching: true,
  contractTypes: undefined,
  contractTypesByBlockchain: undefined,
};

export const TonClientContext = React.createContext({
  bridge: undefined,
  tonCrystal: undefined,
  tonSurf: undefined,
  metaMask: undefined,
});
export const AuthContext = React.createContext(authContextValue);
export const ContractContext = React.createContext(contractContextValue);
export const CommissionsContext = React.createContext(undefined);

const config = getConfig().publicRuntimeConfig.ton;
const envNetwork = config.surfNet;

const App = ({ Component, pageProps }) => {
  const [likesCollectionData, setLikesCollectionData] = useState(undefined);
  const [networkError, setNetworkError] = useState(false);
  const [wallets, setWallets] = useState(undefined);
  const [integrations, setIntegrations] = useState(undefined);
  const [walletAddress, setWalletAddress] = useState(undefined);
  const [hashes, setHashes] = useState(
    cookies.get('surfAddresses', { path: '/' })
      ? cookies.get('surfAddresses', { path: '/' }).split('|')
      : undefined,
  );
  const [session, setSession] = useState(hashes ? hashes[0] : undefined);
  const [tsWallet, setTsWallet] = useState(cookies.get('currentTsWallet') || undefined);
  const [walletType, setWalletType] = React.useState(
    walletTypes[cookies.get('walletType', { path: '/' })],
  );
  const [blockchain, setBlockchain] = React.useState(cookies.get('blockchain', { path: '/' }));

  useEffect(() => {
    const auth = new AuthLocalStorage();

    auth.setBlockchain(blockchain);
  }, [blockchain]);

  const [isUpdateSession, setUpdateSession] = useState(
    !!cookies.get('surfAddresses', { path: '/' }),
  );
  const [tsWallets, setTsWallets] = useState(cookies.get('tsWallets') || undefined);

  React.useEffect(() => {
    const token = pageProps.pageQueryParams.token || undefined;
    const walAddress = pageProps.pageQueryParams.walletAddress || undefined;

    if (token && walAddress) {
      (async () => {
        const res = await Auth.finishSurfAuth(token, walAddress);

        if (res) {
          if (!tsWallets) {
            cookies.set('tsWallets', [walAddress], {
              path: '/',
              maxAge: 604800000,
            });
            setTsWallets([walAddress]);
          } else {
            const isDuplicate = tsWallets.find((t) => walAddress === t);

            if (!isDuplicate) {
              cookies.set('tsWallets', [walAddress, ...tsWallets], {
                path: '/',
                maxAge: 604800000,
              });
              setTsWallets([walAddress, ...tsWallets]);
            }
          }

          cookies.set('walletType', walletTypes.SF, { path: '/', maxAge: 604800000 });
          cookies.set('currentTsWallet', walAddress, { path: '/', maxAge: 604800000 });
          setWalletType(walletTypes.SF);
          setWalletAddress(walAddress);
          setTsWallet(walAddress);
        }
      })();
    }
  }, []);

  useGqlQuery(getIntegrations, {
    errorPolicy: 'ignore',
    onCompleted: (data) => {
      setIntegrations(data.integrations || undefined);
    },
  });

  const { data: networksDataGQL } = useGqlQuery(getNetworks, { errorPolicy: 'ignore' });

  const { data: commissions } = useGqlQuery(getCommissions, { errorPolicy: 'ignore' });

  const { width, maxMobileWidth } = useWindowDimensions();
  const tonClientBridge = useMemo(() => {
    return new TonClientBridge(commissions?.commissions);
  }, [commissions]);

  const tonCrystal = useMemo(() => {
    return new EverWallet(commissions?.commissions);
  }, [commissions]);

  const tonSurf = useMemo(() => {
    return new EverSurf(commissions?.commissions);
  }, [commissions]);

  const metaMask = useMemo(() => {
    return new MetaMask();
  }, [commissions]);

  const tonClientContextValue = {
    bridge: tonClientBridge,
    tonCrystal,
    tonSurf,
    metaMask,
  };

  useEffect(() => {
    if (integrations) {
      (async () => {
        const walletsTmp = {
          [walletTypes.ET]: {
            hasProvider: tonClientBridge.hasProvider,
            name: walletTypes.ET,
            title: integrations.find((item) => item.code === walletTypes.ET)?.name,
            status: integrations.find((item) => item.code === walletTypes.ET)?.status,
            blockchain: integrations.find((item) => item.code === walletTypes.ET)?.blockchain,
          },
          [walletTypes.EW]: {
            hasProvider: tonCrystal.hasProviderEverWallet
              ? await tonCrystal.hasProviderEverWallet()
              : false,
            name: walletTypes.EW,
            title: integrations.find((item) => item.code === walletTypes.EW)?.name,
            status: integrations.find((item) => item.code === walletTypes.EW)?.status,
            blockchain: integrations.find((item) => item.code === walletTypes.EW)?.blockchain,
          },
          [walletTypes.SF]: {
            hasProvider: true,
            name: walletTypes.SF,
            title: integrations.find((item) => item.code === walletTypes.SF)?.name,
            status: integrations.find((item) => item.code === walletTypes.SF)?.status,
            blockchain: integrations.find((item) => item.code === walletTypes.SF)?.blockchain,
          },
          [walletTypes.MM]: {
            hasProvider: true,
            name: walletTypes.MM,
            title: integrations.find((item) => item.code === walletTypes.MM)?.name,
            status: integrations.find((item) => item.code === walletTypes.MM)?.status,
            blockchain: integrations.find((item) => item.code === walletTypes.MM)?.blockchain,
          },
        };
        setWallets(walletsTmp);
      })();
    }
  }, [integrations, tonClientBridge.hasProvider]);

  let isAuth = false;
  if (walletAddress) {
    const auth = new AuthLocalStorage();
    isAuth = auth.getTokenByWalletAddress(walletAddress);
  }

  const { isAuthenticated, setIsAuthenticated, user, isFetching, fetchUser, setUser } = useGetUser(
    walletType,
    wallets,
    walletAddress,
    integrations,
    isAuth,
  );

  useEffect(() => {
    if (isAuthenticated && user) setIsAuthenticated(true);
  }, [isAuthenticated]);

  const { isFetching: loadingContracts, contracts, contractTypes } = useGetContracts({});

  const [contractTypesByBlockchain, setContractTypesByBlockchain] = useState([]);

  useEffect(() => {
    if (walletType && wallets && contractTypes) {
      setContractTypesByBlockchain(
        contractTypes.filter(
          ({ applicableBlockchains, status }) =>
            status === 'active' &&
            applicableBlockchains &&
            applicableBlockchains.includes(wallets[walletType].blockchain),
        ),
      );
    }

    if (walletType === walletTypes.ET && wallets) {
      (async () => {
        await tonClientBridge.init();
        const wallet = await tonClientBridge.getWallet();
        if (wallet) {
          const item = wallets[walletType];
          setWalletAddress(wallet?.address || '');
          tonClientBridge.onWalletChange();

          cookies.set('walletType', item.name, {
            path: '/',
            maxAge: 604800000,
          });

          cookies.set('blockchain', item.blockchain, {
            path: '/',
            maxAge: 604800000,
          });
        } else {
          setWalletAddress('');
        }
      })();
    }
  }, [tonClientBridge, walletType, wallets]);

  useEffect(() => {
    if (walletType === walletTypes.EW && wallets) {
      (async () => {
        const ton = await tonCrystal.initEverWallet();
        if (ton === 'foo') setWalletAddress('');
        const wallet = await tonCrystal.getWallet();
        if (wallet) {
          setWalletAddress(wallet?.address || '');
          tonCrystal.onWalletChange();
        } else {
          setWalletAddress('');
        }
      })();
    }
  }, [tonCrystal, walletType, wallets]);

  useEffect(() => {
    if (walletType === walletTypes.MM && wallets) {
      (async () => {
        const meta = await metaMask.init();
        if (!meta) setWalletAddress('');

        const wallet = metaMask.getWallet();
        if (wallet) {
          setWalletAddress(wallet);
          setBlockchain('binance');
        } else {
          setWalletAddress('');
        }
      })();
    }
  }, [walletType, wallets, metaMask]);

  useEffect(() => {
    if (walletType === walletTypes.SF && wallets) {
      (async () => {
        await tonSurf.init(tsWallet);
      })();
    }
  }, [tonSurf, walletType, wallets, tsWallet]);

  useEffect(() => {
    tonSurf.setWallet(tsWallet);
    setWalletAddress(tsWallet);
    setTsWallets(tsWallets);
    setBlockchain('everscale');
  }, [tonSurf, walletType, wallets, session]);

  useEffect(() => {
    if (wallets && !walletType && Object.keys(wallets).find((item) => wallets[item].hasProvider)) {
      setWalletType(wallets[Object.keys(wallets).find((item) => wallets[item].hasProvider)].name);
    }
  }, [wallets]);

  useEffect(() => {
    const interval = setInterval(() => {
      const network = JSON.parse(localStorage.getItem('network') || '{}');
      const filteredObject = networksDataGQL?.networks?.filter(
        (item) => item.type === envNetwork && item.integration === walletType,
      )[0];
      if (Object.keys(network).length && filteredObject?.name) {
        setNetworkError(filteredObject?.name !== network[walletType]);
      } else {
        setNetworkError(false);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [walletType, networksDataGQL]);

  return (
    <TonClientContext.Provider value={tonClientContextValue}>
      <DataContextProvider>
        <AuthContext.Provider
          value={{
            isAuthenticated,
            setIsAuthenticated,
            user,
            fetchUser,
            isFetching,
            walletAddress,
            setWalletAddress,
            setUser,
            type: walletType,
            tsWallets,
            setSession,
            session,
            setWalletType,
            wallets,
            tsWallet,
            hashes,
            setUpdateSession,
            setTsWallet,
            setHashes,
            networkError,
            blockchain,
            setBlockchain,
            likesCollectionData,
            setLikesCollectionData,
          }}>
          <ContractContext.Provider
            value={{
              isFetching: loadingContracts,
              contractTypes,
              contractTypesByBlockchain,
              contracts,
            }}>
            <CommissionsContext.Provider value={commissions?.commissions}>
              <div className={cn('defaultTheme', 'mobileSize', classes.page)}>
                <Header />
                <Container className={classes.page__container}>
                  <Component {...pageProps} />
                </Container>
                {width < maxMobileWidth && <MobileUnderMenu />}
                <Footer />
              </div>
            </CommissionsContext.Provider>
          </ContractContext.Provider>
        </AuthContext.Provider>
      </DataContextProvider>
    </TonClientContext.Provider>
  );
};

export default App;
