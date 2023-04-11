import { ObjectID } from 'typeorm';
import { IToken } from './Token';
import { GQLAsk, GQLAuction, GQLBid, GQLEndorsement, GQLSeries } from '../graphql.schema';

export interface ITokenInfoDto extends IToken {
  auction?: GQLAuction;
  bids?: GQLBid[];
  series?: GQLSeries;
  ask?: GQLAsk;
  endorsement?: GQLEndorsement;
}

interface IBidRaw {
  bidCreator: string;
  bidValue: string;
  endTime: number;
  superType: string;
  tokenAddress: string;
  tokenID: string;
}

interface IBidDeployed {
  bidAddress: string;
  bidValue: string;
  endTime: number;
  status: string;
  superType: string;
  tokenAddress: string;
  tokenID: string;
  bidCreator: string;
}

export interface IBid {
  _id: ObjectID;
  createdAt: number;
  deployed: IBidDeployed;
  raw: IBidRaw;
  updatedAt: number;
  bidID: string;
}

export interface IAuction {
  _id: ObjectID;
  createdAt: number;
  deployed: IAuctionDeployed;
  raw: IAuctionRaw;
  updatedAt: number;
}

interface IAuctionRaw {
  auctionCreator: string;
  endTime: number;
  showcaseFee: string;
  startBid: string;
  startTime: number;
  stepBid: string;
  superType: string;
  tokenAddress: string;
  tokenID: string;
}

interface IAuctionDeployed {
  auctionAddress: string;
  auctionID: string;
  bids: [IAuctionDeployedBid];
  endTime: string;
  finishBid: string;
  startBid: string;
  startTime: string;
  status: string;
  stepBid: string;
  superType: string;
  tokenAddress: string;
  tokenID: string;
}

interface IAuctionDeployedBid {
  bidCreator: string;
  bidStatus: string;
  bidValue: string;
}
