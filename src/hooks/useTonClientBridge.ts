import { useContext } from 'react';
import { AuthContext, TonClientContext } from '../features/app';
import TonClientBridge from '../config/ton/Extraton';
import EverSurf from '../config/ton/EverSurf';
import EverWallet from '../config/ton/EverWallet';
import MetaMask from '../config/binance/Metamask';
import { walletTypes } from '../types/wallet';

export const mapTypeToContext = {
  [walletTypes.ET]: 'bridge',
  [walletTypes.EW]: 'tonCrystal',
  [walletTypes.SF]: 'tonSurf',
  [walletTypes.MM]: 'metaMask',
} as const;

const useTonClientBridge = () => {
  const context = useContext(TonClientContext);
  const { type } = useContext(AuthContext) as { type?: walletTypes };

  return type
    ? (context[mapTypeToContext[type]] as unknown as TonClientBridge | EverSurf | EverWallet)
    : (undefined as unknown as TonClientBridge | EverSurf | EverWallet);
};

export default useTonClientBridge;
