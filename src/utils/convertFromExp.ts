export const convertFromExp = (n: number) => {
  const data = String(n).split(/[eE]/);
  if (data.length === 1) return data[0];

  let z = '';
  const sign = n < 0 ? '-' : '';
  const str = data[0]?.replace('.', '');
  let mag = Number(data[1]) + 1;

  if (mag < 0) {
    z = `${sign}0.`;
    // eslint-disable-next-line no-plusplus
    while (mag++) z += '0';
    // eslint-disable-next-line no-useless-escape
    return z + str?.replace(/^\-/, '');
  }
  mag -= str?.length || 0;
  // eslint-disable-next-line no-plusplus
  while (mag--) z += '0';
  return str + z;
};
