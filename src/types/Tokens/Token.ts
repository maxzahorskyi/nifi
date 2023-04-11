import { ObjectID } from 'typeorm';
import { IUser } from '../User/User';
import { GQLAsk, GQLAuction, GQLBid, GQLToken } from '../graphql.schema';
import { IBid } from './TokenInfo';
import { TokenType } from '../../features/Token/TokenService';

class DateTime extends Date {}

export interface IToken extends GQLToken {
  auction?: GQLAuction;
  bids?: GQLBid[];
  ask?: GQLAsk;
}

interface ITokenDeployed {
  address: string;
  creator: string;
  creatorFees: string;
  hash: string;
  owner: IUser;
  ownerPublicKey: string;
  seriesID: ISeries;
  superType: string;
  tokenID: string;
  type: string;
}

export interface ISeries {
  _id: ObjectID;
  createdAt: DateTime;
  deployed: ISeriesDeployed;
  raw: ISeriesRaw;
  updatedAt: DateTime;
  seriesID: string;
}

interface ISeriesRaw {
  description: string;
  hash: string;
  media: ISeriesRawImage[];
  numberOfEditions: number;
  superType: string;
  title: string;
  type: string;
}

interface ISeriesRawImage {
  hash: string;
  height: number;
  mimetype: string;
  subtitle: string;
  weight: number;
  width: number;
}

interface ISeriesDeployed {
  address: string;
  creator: string;
  creatorFees: string;
  hash: string;
  maximum: string;
  superType: string;
  supply: string;
  type: string;
}

interface ITokenRaw {
  creator: string;
  creatorFees: string;
  description: string;
  hash: string;
  images: ITokenRawImage[];
  seriesID: string;
  superType: string;
  title: string;
  type: string;
}

interface ITokenRawImage {
  hash: string;
  height: number;
  mimetype: string;
  subtitle: string;
  weight: number;
  width: number;
}

export enum ContractTypes {
  auc = 'auc',
  ask = 'ask',
  bid = 'bid',
}

export enum TokenSaleType {
  Auction = 'Auction',
  Offer = 'Offer',
  Pending = 'Pending',
  Ask = 'Ask',
  Endorsement = 'Endorsement',
  Forever = 'Forever',
}

export enum TokenSaleTypeLabels {
  Auction = 'Auction',
  Offer = 'Bid',
  Pending = 'Auction',
  Ask = 'On Sale',
  Endorsement = 'On Endorsement',
  Forever = 'Forever',
}

export interface TokenSaleInfo {
  saleType: TokenSaleType;
  endOfferTime: number | undefined;
  isExpired: boolean;
  endTime: number | undefined;
  startTime: number | undefined;
  currentPrice: number | undefined;
  bestPrice: number | undefined;
  numberOfCustomers: number;
  step: number;
  startPrice: number | undefined;
  bestOffer: IBid | undefined;
}

export interface FormMedia {
  subtitle: string;
  file: File;
  width: number;
  height: number;
  role?: string;
}

export const initialFormValues = {
  media: [] as FormMedia[] | undefined,
  frame: [] as FormMedia[] | undefined,
  title: '',
  type: TokenType.Art1,
  collectionID: undefined,
  numberOfEditions: 1,
  fee: 0,
  description: '',
  stampId: undefined,
  format: undefined,
};

export type FormValues = typeof initialFormValues;
export type SetFieldValue = <FieldKey extends keyof FormValues>(
  field: FieldKey,
  value: FormValues[FieldKey],
  shouldValidate?: boolean,
) => void;
