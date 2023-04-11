import { TokenType } from '../../features/Token/TokenService';

// Default token type was set to Seal

export const urls = {
  tokenCreate: {
    default: '/token/create/seal',
    route: '/token/create',
  },
};

// There was added TokenType.Endorsable
// Why '4ever' ?

export const routeMap: Record<string, TokenType> = {
  stamp1: TokenType.Stamp,
  endorsable: TokenType.Endorsable,
  seal: TokenType.Seal,
  '4ever': TokenType.Forever,
  art1: TokenType.Art1,
  art2: TokenType.Art2,
  collectible: TokenType.Collectible,
};

export const routeToTypeMap: Record<TokenType, string> = {
  [TokenType.Stamp]: 'stamp1',
  [TokenType.Endorsable]: 'endorsable',
  [TokenType.Seal]: 'seal',
  [TokenType.Forever]: '4ever',
  [TokenType.Art1]: 'art1',
  [TokenType.Art2]: 'art2',
  [TokenType.Collectible]: 'collectible',
};

export const enum PageType {
  HOME = 'Home',
  GALLERY = 'Gallery',
  ACTIVITY = 'Activity',
  COLLECTIONS = 'Collections',
}
