export const generateBidId = (root: string, bidNum: string) => {
  return `${root}__${bidNum}`;
};
