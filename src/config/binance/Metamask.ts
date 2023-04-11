import { message } from 'antd';
import Cookies from 'universal-cookie';
import Web3 from 'web3';

const cookies = new Cookies();

class MetaMask {
  web3: Web3 | undefined;
  currentAccount: String | undefined;
  accounts: String[] = [];

  public async refresh() {
    await this.init();
  }

  public async init() {
    //@ts-ignore
    if (window && typeof window.ethereum !== 'undefined') {
      this.web3 = new Web3(Web3.givenProvider || 'https://data-seed-prebsc-1-s1.binance.org:8545');

      //@ts-ignore
      window.ethereum.on('accountsChanged', (accounts: String[]) => {
        if (accounts && accounts.length <= 0) {
          cookies.remove('walletType');
          cookies.remove('blockchain');
        }

        window.location.reload();
      });

      if (this.web3) {
        return await this.requestAccounts();
      }
      return false;
    }
    return false;
  }

  private async requestAccounts() {
    if (this.web3) {
      try {
        const accounts = await this.web3.eth.requestAccounts();

        if (accounts && accounts.length > 0) {
          this.accounts = accounts;
          // eslint-disable-next-line prefer-destructuring
          this.currentAccount = accounts[0];
        }
      } catch (error: any) {
        message.error(error.message);
      }
    }

    return null;
  }

  public async getAuthSignature(): Promise<string> {
    const message = 'AUTHAUTHAUTHAUTHAUTHAUTHAUTHAUTH';
    //@ts-ignore
    const signature = await window.ethereum.request({
      method: 'personal_sign',
      params: [message, this.currentAccount],
    });

    return signature;
  }

  public async getInitializedWallet(): Promise<any> {
    return await new Promise((res) => res({ address: this.currentAccount }));
  }

  public isAuthSupported(): boolean {
    return true;
  }

  public getWallet() {
    return this.currentAccount;
  }
}

export default MetaMask;
