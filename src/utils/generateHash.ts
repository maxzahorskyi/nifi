import crypto, { BinaryToTextEncoding } from 'crypto';

const generateHash = (value: string, digest: BinaryToTextEncoding) => {
  const hash = crypto.createHash('sha256');

  return hash.update(value).digest(digest);
};

export default generateHash;
