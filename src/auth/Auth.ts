/* eslint-disable */
import Wallet from '../config/ton/Wallet';
import { HttpClient } from '../utils/HttpClient';
import { mutexLockOrAwait, mutexUnlock } from '../utils/mutex';
import { AuthLocalStorage } from './AuthLocalStorage';
import getConfig from 'next/config';
import { Result } from '../utils/Result';
import EverSurf from '../config/ton/EverSurf';
import { walletTypes } from '../types/wallet';

const everConfig = getConfig().publicRuntimeConfig.ton;

export async function auth(): Promise<Auth> {
  return await Auth.getInstance();
}

export class Auth {
  private static instance: Auth | null = null;

  private isSigning = false;

  private readonly authClient: AuthHttpClient;
  private readonly authLocalStorage = new AuthLocalStorage();

  constructor(baseUrl: string) {
    this.authClient = new AuthHttpClient(baseUrl);
  }

  public static async getInstance(): Promise<Auth> {
    const mutexName = 'getting_auth';
    await mutexLockOrAwait(mutexName);

    try {
      return await this.getInstanceInternal();
    } finally {
      mutexUnlock(mutexName);
    }
  }

  private static async getInstanceInternal(): Promise<Auth> {
    if (this.instance === null) {
      const url = getConfig().publicRuntimeConfig.services.authUrl;
      const auth = new Auth(url);

      this.instance = auth;
    }

    return this.instance;
  }

  public static async finishSurfAuth(token: string, walletAddress: string): Promise<boolean> {
    return await (await this.getInstance()).finishSurfAuth(token, walletAddress);
  }

  public static async requestSurfAuth(returnUrl: string, everSurf: EverSurf): Promise<string> {
    return await (await this.getInstance()).requestSurfAuth(returnUrl, everSurf);
  }

  private async finishSurfAuth(token: string, walletAddress: string): Promise<boolean> {
    const remoteWalletAddress = await this.authClient.check(token);

    if (!remoteWalletAddress.success) {
      throw new Error(remoteWalletAddress.error);
    }

    if (remoteWalletAddress.data !== walletAddress) {
      return false;
    }

    this.authLocalStorage.setTokenByWalletAddress(walletAddress, token);

    return true;
  }

  private async requestSurfAuth(returnUrl: string, everSurf: EverSurf): Promise<string> {
    const authMessage = await everSurf.getMessage(returnUrl);

    if (!authMessage.is_success) {
      // @ts-ignore
      throw new Error(authMessage.error?.message);
    }

    const data = authMessage.data as { message: string };

    return (
      'https://uri.ever.surf/debot/' +
      `${everConfig.contractAddress.sessionRoot}` +
      `?message=${data.message}` +
      `&net=${everConfig.surfNet}`
    );
  }

  private async getWalletAddress(wallet: Wallet): Promise<string> {
    return (await wallet.getInitializedWallet()).address;
  }

  public async isAuthenticated(wallet: Wallet): Promise<boolean> {
    return this.authLocalStorage.hasTokenForWalletAddress(await this.getWalletAddress(wallet));
  }

  public isWalletAddressAuthenticated(walletAddress: string): boolean {
    return this.authLocalStorage.hasTokenForWalletAddress(walletAddress);
  }

  public async getToken(wallet: Wallet): Promise<string | null> {
    return this.getTokenByWalletAddress(await this.getWalletAddress(wallet));
  }

  public getTokenByWalletAddress(walletAddress: string): string | null {
    return this.authLocalStorage.getTokenByWalletAddress(walletAddress);
  }

  public async getAssertedToken(wallet: Wallet): Promise<string> {
    return this.getAssertedTokenByWalletAddress(await this.getWalletAddress(wallet));
  }

  public getAssertedTokenByWalletAddress(walletAddress: string): string {
    const token = this.getTokenByWalletAddress(walletAddress);

    if (token === null) {
      throw new Error('The wallet is not authorized on this device. Please authorise it');
    }

    return token;
  }

  public async sign(wallet: Wallet | any, walletType?: walletTypes): Promise<void> {
    if (this.isSigning) {
      throw new Error('Already signing');
    }

    this.isSigning = true;

    try {
      await this.signInternal(wallet, walletType);
    } finally {
      this.isSigning = false;
    }
  }

  private async signInternal(wallet: Wallet, walletType?: walletTypes): Promise<void> {
    if (!wallet.isAuthSupported()) {
      return;
    }

    const walletAddress = await this.getWalletAddress(wallet);

    if (this.isWalletAddressAuthenticated(walletAddress)) {
      return;
    }

    const signature = await wallet.getAuthSignature();
    const signResult = await this.authClient.sign(walletAddress, signature, walletType);

    if (!signResult.success) {
      throw new Error(signResult.error);
    }

    const token = signResult.data;

    this.authLocalStorage.setTokenByWalletAddress(walletAddress, token);
  }
}

class AuthHttpClient {
  private readonly httpClient: HttpClient;

  constructor(baseUrl: string) {
    this.httpClient = new HttpClient(baseUrl);
  }

  public async check(token: string): Promise<Result<string | null, string>> {
    const response = await this.httpClient.requestGet(
      '/check/' + token,
      HttpClient.isNullableResponse(isString),
      isString,
    );

    return response;
  }

  public async sign(
    walletAddress: string,
    signature: string,
    walletType?: walletTypes,
  ): Promise<Result<string, string>> {
    const input = { walletAddress, signature, walletType };
    const response = await this.httpClient.requestPost('/sign', input, isString, isString);

    return response;
  }
}

function isString(input: unknown): input is string {
  return typeof input === 'string';
}
