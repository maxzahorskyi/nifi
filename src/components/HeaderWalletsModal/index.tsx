import classes from './index.module.scss';
import { Menu, message, Modal, Radio } from 'antd';
import { walletTypes } from '../../types/wallet';
import ExtratonFull from '../../../public/icons/ExtratonFull.svg';
import EverFull from '../../../public/icons/EverFull.svg';
import SurfFull from '../../../public/icons/SurfFull.svg';
import MetaFull from '../../../public/icons/MetamaskFull.svg';
import BinanceIcon from '../../../public/icons/binanceSign.svg';
import EversurfIcon from '../../../public/icons/everscaleSign.svg';
import { toFormatWalletAddress } from '../../utils/toFormatWalletAddress';
import Button, { ButtonType } from '../Button';
import React, { useContext, useEffect, useState } from 'react';
import useAuthContext from '../../hooks/useAuthContext';
import useTonClientBridge, { mapTypeToContext } from '../../hooks/useTonClientBridge';
import Cookies from 'universal-cookie';
import { useLocales } from '../../hooks/locales';
import useWindowDimensions from '../../hooks/useWindowDimensions';
import { useNetworkError } from '../../hooks/useNetworkError';
import EverSurf from '../../config/ton/EverSurf';
import EverWallet from '../../config/ton/EverWallet';
import TonClientBridge from '../../config/ton/Extraton';
import { TonClientContext } from '../../features/app';
import { Auth } from '../../auth/Auth';
import cn from 'classnames';
import MetaMask from '../../config/binance/Metamask';
import { useRouter } from 'next/router';
import Wallet from '../../config/ton/Wallet';
import { AuthLocalStorage } from '../../auth/AuthLocalStorage';

const cookies = new Cookies();

enum buttonTypes {
  'S' = 'Select',
  'R' = 'Refresh',
  'SR' = 'Select and refresh',
  'SEW' = 'Select Ever Wallet',
  'CEW' = 'Change Ever Wallet',
}

const HeaderWalletsModal = ({ handlers: { setTonSurfOpen } }: Props) => {
  const tonClientBridge = useTonClientBridge();
  const context = useContext(TonClientContext);

  const router = useRouter();

  const {
    user,
    wallets,
    type,
    setWalletType,
    tsWallets,
    tsWallet: tsContext,
    setTsWallet: setTsWalletContext,
    setUpdateSession,
    walletAddress,
    networkError,
    session,
    isAuthenticated,
    setIsAuthenticated,
    setWalletAddress,
  } = useAuthContext();

  const uniqueAddress = [...new Set(tsWallets)];
  const { onNetworkErrorClick, onNetworkSuccessClick } = useNetworkError();
  const { width, maxMobileWidth } = useWindowDimensions();
  const [tabs, setTabs] = React.useState<Array<'everscale' | 'binance'>>([]);
  const [currentTab, setCurrentTab] = React.useState<'everscale' | 'binance'>(
    cookies.get('blockchain') || 'everscale',
  );
  const [radioValue, setRadioValue] = React.useState<walletTypes | undefined>(
    type || walletTypes.SF,
  );
  const [tsWallet, setTsWallet] = React.useState<string | undefined>(tsContext);
  const [currentTsWallet, setCurrentTsWallet] = React.useState<any>(cookies.get('currentTsWallet'));
  const [buttonColor, setButtonColor] = React.useState<boolean>(false);
  const [isModalOpen, setModalOpen] = React.useState<boolean>(false);
  //locales
  const [walletButtonLocale, setWalletButtonLocale] = React.useState<string | undefined>();

  const [clearOnLoad, setClearOnLoad] = React.useState<boolean>(false);

  const [onLoadWallet, setOnLoadWallet] = React.useState<string[] | undefined>();

  const [everWalletButtonText, setEverWalletButtonText] = React.useState<string | undefined>();

  const [browserExtensions, setBrowserExtensions] = React.useState<boolean>(false);

  useEffect(() => {
    if (tabs.length !== 0) return;
    if (wallets) {
      const everscale = Object.keys(wallets).find(
        (i) => wallets[i]?.blockchain === 'everscale' && wallets[i]?.status === 'active',
      );
      const binance = Object.keys(wallets).find(
        (i) => wallets[i]?.blockchain === 'binance' && wallets[i]?.status === 'active',
      );
      if (everscale) {
        setTabs((prev) => [...prev, 'everscale']);
      }
      if (binance) {
        setTabs((prev) => [...prev, 'binance']);
      }
    }
  }, [wallets]);

  useEffect(() => {
    if (tabs && tabs.length === 1) {
      // @ts-ignore
      setCurrentTab(tabs[0]);
    }
  }, [tabs]);

  useEffect(() => {
    const browserExt = [walletTypes.ET, walletTypes.EW];
    if (wallets) {
      const obj = Object.keys(wallets)
        .filter((item) => wallets[item]?.hasProvider)
        .map((item: walletTypes | any) => browserExt.includes(item))
        .includes(true);

      setBrowserExtensions(obj);
    }
  }, [wallets]);

  // Do not show a message about a successful network change when the page loads
  useEffect(() => {
    if (!clearOnLoad) return setClearOnLoad(true);

    if (networkError) {
      onNetworkErrorClick();
    } else {
      onNetworkSuccessClick();
    }
  }, [networkError]);

  useLocales({
    skipQuery: false,
    variables: {
      query: {
        lang: 'EN',
        module: {
          type: width > maxMobileWidth ? 'desktop' : 'mobile',
          page: 'global',
          module: 'header',
        },
      },
    },
    onSuccess: (data) => {
      data.forEach((item) => {
        switch (item.stringName) {
          case 'walletButton':
            setWalletButtonLocale(item.string);
            break;

          default:
            break;
        }
      });
    },
    onError: (e) => {
      console.log(e);
    },
  });

  useEffect(() => {
    !onLoadWallet?.length && uniqueAddress.length && setOnLoadWallet(uniqueAddress);
  }, [uniqueAddress]);

  useEffect(() => {
    if (onLoadWallet?.length && onLoadWallet?.length !== uniqueAddress.length) {
      setTsWallet(uniqueAddress[uniqueAddress.length - 1]);
      if (tsWallet) {
        setOnLoadWallet(uniqueAddress);
        onWalletChange(radioValue);
      }
    }
  }, [session, type, onLoadWallet, tsWallet]);

  const onWalletChange = async (value: walletTypes | undefined) => {
    switch (value) {
      case walletTypes.EW:
        if (tonClientBridge && tonClientBridge.refresh) {
          await tonClientBridge.refresh();
        }
        setButtonColor(true);
        break;
      case walletTypes.ET:
        setButtonColor(false);
        break;
      case walletTypes.SF:
        tsWallet && cookies.set('currentTsWallet', tsWallet, { path: '/', maxAge: 2592000 });
        setTsWalletContext(tsWallet);
        setUpdateSession(true);
        break;
      case walletTypes.MM:
        // @ts-ignore
        await context.metaMask.refresh();
        setButtonColor(true);
        break;
      default:
        break;
    }

    if (value !== undefined) {
      const newWallet = context[mapTypeToContext[value]] as unknown as
        | TonClientBridge
        | EverSurf
        | EverWallet
        | MetaMask;

      const auth = await Auth.getInstance();

      try {
        await auth.sign(newWallet, value === walletTypes.MM ? value : undefined);
      } catch (error: any) {
        message.error(error.message);
        return;
      }
    }

    setWalletType(radioValue);
    setModalOpen(false);

    cookies.set('walletType', radioValue, {
      path: '/',
      maxAge: 604800000,
    });

    if (typeof value !== 'undefined' && wallets) {
      cookies.set('blockchain', wallets[value]?.blockchain, {
        path: '/',
        maxAge: 604800000,
      });
    }

    window.location.reload();
  };

  const modalButtonText = (radioValue: walletTypes | string | undefined) => {
    if (type === radioValue && type === walletTypes.ET) {
      return buttonTypes.S;
    }

    if (type === radioValue) {
      return buttonTypes.R;
    }

    return buttonTypes.S;
  };

  useEffect(() => {
    setEverWalletButtonText(undefined);

    switch (radioValue) {
      case walletTypes.ET:
        walletTypes.ET === type && setButtonColor(false);
        break;
      case walletTypes.EW:
        walletTypes.EW === type
          ? setEverWalletButtonText(buttonTypes.CEW)
          : setEverWalletButtonText(buttonTypes.SEW);
        !buttonColor && setButtonColor(true);
        break;
      default:
        setButtonColor(true);
        break;
    }
  }, [radioValue, type]);

  const handleChangeTab = React.useCallback((e) => {
    setCurrentTab(e.key);
  }, []);

  const tabItems = () => {
    const items = [];

    if (tabs.includes('everscale')) {
      items.push({
        label: 'Everscale',
        key: 'everscale',
        icon: <EversurfIcon />,
        className: cn(classes.tabs__item, currentTab === 'everscale' && classes.tabs__active),
      });
    }

    if (tabs.includes('binance')) {
      items.push({
        label: 'Binance',
        key: 'binance',
        icon: <BinanceIcon />,
        className: cn(classes.tabs__item, currentTab === 'binance' && classes.tabs__active),
      });
    }

    return items;
  };

  const checkAuth = async (wallet?: string) => {
    if (!isAuthenticated && wallet) {
      const auth = new AuthLocalStorage();

      const isAuth = auth.getTokenByWalletAddress(wallet);

      setIsAuthenticated(!!isAuth);
    }

    if (!wallet && setWalletAddress) {
      setWalletAddress('');
    }
  };

  useEffect(() => {
    checkAuth(walletAddress);
  }, [isAuthenticated, walletAddress]);

  return (
    <>
      <div
        className={classes.walletIcon}
        onClick={() => setModalOpen(!isModalOpen)}
        onMouseEnter={() => {
          if (networkError && walletAddress) {
            return message.error('You need to change network in active wallet', 3);
          }
          if (!isAuthenticated && walletAddress) {
            return message.warning(
              'Your wallet is not authorised on this device. Please authorise it',
              3,
            );
          }
          if (isAuthenticated && walletAddress && !user) {
            return message.warning(
              <>
                You need to create account to have full functionality.
                <span className="createButton" onClick={(e) => router.push('/user/account/create')}>
                  Create
                </span>
              </>,
              3,
            );
          }
          return;
        }}>
        {walletAddress ? type : walletButtonLocale}

        {networkError && walletAddress ? (
          <div className={classes.networkErrorCircle} />
        ) : !isAuthenticated || !walletAddress ? (
          <div className={cn(classes.notAuthenticated, classes.networkErrorCircle)} />
        ) : null}
      </div>
      <Modal
        title="Wallet selection"
        visible={isModalOpen}
        className="modal"
        onCancel={() => setModalOpen(false)}>
        <>
          <Menu
            className={classes.tabs}
            onClick={handleChangeTab}
            defaultSelectedKeys={[currentTab]}
            selectedKeys={[currentTab]}
            items={tabItems()}
            mode="horizontal"
          />
          <div className={classes.walletBody}>
            {currentTab === 'everscale' && tabs.includes('everscale') && (
              <Radio.Group
                value={radioValue || type}
                onChange={(e) => {
                  setRadioValue(e.target.value);
                  setButtonColor(true);
                }}
                className={classes.walletsModal}>
                {wallets &&
                  Object.keys(wallets)
                    .filter((item) => wallets[item]?.hasProvider)
                    .map((item, index) => {
                      if (wallets[item]?.status !== 'active') return null;
                      if (item === 'MM') return null;
                      return item !== walletTypes.SF ? (
                        <>
                          {browserExtensions && (
                            <span className={classes.title}>Chrome extensions</span>
                          )}
                          <Radio
                            value={wallets[item]?.name}
                            onClick={() => setTsWallet(undefined)}
                            className={classes.walletName}
                            key={index}>
                            {wallets[item]?.name === walletTypes.ET ? (
                              <div className={classes.walletRow}>
                                <ExtratonFull />
                                <span>Automatic</span>
                              </div>
                            ) : (
                              <div className={classes.walletRow}>
                                <EverFull />
                                <span>Manual</span>
                              </div>
                            )}
                          </Radio>
                        </>
                      ) : (
                        <React.Fragment key={index.toString()}>
                          <span
                            className={classes.title}
                            style={{ marginTop: `${browserExtensions ? '15px' : '0px'}` }}>
                            Mobile & Web applications
                          </span>
                          <div className={classes.TSColumnChild} key={index}>
                            <div className={classes.sfWrapper}>
                              <SurfFull className={classes.surfFull} />
                              <Radio value={wallets[item]?.name} className={classes.TSLabel}>
                                <div className={classes.title}>Manual</div>
                                <div
                                  className={classes.addWallet}
                                  onClick={() => {
                                    setRadioValue(walletTypes.SF);
                                    setWalletType(walletTypes.SF);
                                    setTonSurfOpen(true);
                                    setModalOpen(false);
                                  }}>
                                  <div
                                    onClick={() => {
                                      setTonSurfOpen(true);
                                    }}>
                                    <img src="/icons/plusWhite.svg" alt="plusIcon" />
                                  </div>
                                </div>
                              </Radio>
                            </div>

                            <Radio.Group
                              className={classes.wallets}
                              value={
                                radioValue === walletTypes.SF
                                  ? currentTsWallet || tsWallet || tsContext
                                  : undefined
                              }
                              onChange={(e) => {
                                setTsWallet(e.target.value);
                              }}>
                              {uniqueAddress?.map((wallet, index) => (
                                <Radio
                                  value={wallet}
                                  className={classes.TSLabelChild}
                                  key={index}
                                  onClick={() => {
                                    setCurrentTsWallet(wallet);
                                    setRadioValue(item);
                                    setButtonColor(true);
                                  }}>
                                  {toFormatWalletAddress(wallet)}
                                </Radio>
                              ))}
                            </Radio.Group>
                          </div>
                        </React.Fragment>
                      );
                    })}
              </Radio.Group>
            )}

            {currentTab === 'binance' && tabs.includes('binance') && (
              <Radio.Group
                value={radioValue || type}
                onChange={(e) => {
                  setRadioValue(e.target.value);
                  setButtonColor(true);
                }}
                className={classes.walletsModal}>
                {browserExtensions && <span className={classes.title}>Chrome extensions</span>}

                <Radio
                  value="MM"
                  onClick={() => setTsWallet(undefined)}
                  className={classes.walletName}>
                  <div className={classes.walletRow}>
                    <MetaFull />
                    <span>Manual</span>
                  </div>
                </Radio>
              </Radio.Group>
            )}
            <Button
              disabled={
                Boolean(!radioValue) || (radioValue === walletTypes.ET && type === walletTypes.ET)
              }
              styleType={buttonColor ? ButtonType.Primary : ButtonType.Secondary}
              style={{ marginTop: '22px' }}
              onClick={() => onWalletChange(radioValue)}>
              {everWalletButtonText || modalButtonText(radioValue)}
            </Button>
          </div>
        </>
      </Modal>
    </>
  );
};

type Props = {
  handlers: {
    setTonSurfOpen: (v: boolean) => void;
  };
};

export default HeaderWalletsModal;
