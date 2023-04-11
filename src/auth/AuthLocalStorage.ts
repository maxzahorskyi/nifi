type AuthEntry = {
  readonly token: string;
};

export class AuthLocalStorage {
  public getTokenByWalletAddress(walletAddress: string): string | null {
    const rawEntry = localStorage.getItem(`token_${walletAddress}`);

    if (rawEntry === null) return null;

    const authEntry: AuthEntry = JSON.parse(rawEntry);

    return authEntry.token;
  }

  public hasTokenForWalletAddress(walletAddress: string): boolean {
    return !!this.getTokenByWalletAddress(walletAddress);
  }

  public setTokenByWalletAddress(walletAddress: string, token: string): void {
    const authEntry: AuthEntry = { token };

    localStorage.setItem(`token_${walletAddress}`, JSON.stringify(authEntry));
  }

  public setBlockchain(blockchain: string): void {
    localStorage.setItem(`blockchain`, blockchain);
  }
  public getBlockchain(): string | null {
    return localStorage.getItem(`blockchain`);
  }
}
