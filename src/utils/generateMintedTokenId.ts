export const generateMintedTokenId = (seriesID: string, tokenNum: string) => {
  return `${seriesID}-${tokenNum}`;
};
