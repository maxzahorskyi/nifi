// eslint-disable-next-line import/prefer-default-export
export const toFormatWalletAddress = (
  walletAddress: string | undefined,
  numberSize?: number,
  isTokenID?: boolean,
) => {
  if (!walletAddress) {
    return '';
  }

  const walletLengthBefore = walletAddress?.indexOf('_') - 4;

  return `${walletAddress.slice(0, 6)}...${walletAddress.slice(
    isTokenID
      ? walletLengthBefore
      : numberSize
      ? walletAddress.length - numberSize
      : walletAddress.length - 4,
    walletAddress.length,
  )}`;
};
