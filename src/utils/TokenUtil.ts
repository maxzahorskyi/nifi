const PATH_DELIMITER = '-';
// eslint-disable-next-line camelcase
const BASE_ADDR_DELIMITER_v0 = '__';
const PATH_RADIX = 10;

function parseTokenId(id: any) {
  const a = id.split(BASE_ADDR_DELIMITER_v0);
  const b = a[0];
  const baseAddress = b === 0 ? '' : b;
  const c = a[1];
  const path = c === 0 ? '' : c;
  const parts = path.split(PATH_DELIMITER).map((part: string) => {
    return parseInt(part, PATH_RADIX);
  });
  return {
    baseAddress,
    collectionPath: parts.slice(0, -1),
    tokenId: parts.slice(-1)[0],
  };
}

const spreadArray = (to: any, from: any) => {
  // eslint-disable-next-line no-plusplus
  for (let i = 0, il = from.length, j = to.length; i < il; i++, j++) to[j] = from[i];
  return to;
};

export function generateTokenId(
  tokenId: any,
  colId: any[] | undefined,
  baseAddr: string | undefined,
) {
  if (!colId) {
    colId = [];
  }
  if (!baseAddr) {
    baseAddr = '';
  }
  const path = spreadArray(spreadArray([], colId), [tokenId])
    .map((num: any) => {
      return num.toString(PATH_RADIX);
    })
    .join(PATH_DELIMITER);
  return [baseAddr, path].join(BASE_ADDR_DELIMITER_v0);
}

export default parseTokenId;
