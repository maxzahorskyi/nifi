export enum CommissionTypes {
  AuctionCreation = 'AUC-CT-1',
  TokenMint = 'TK-MT-1',
  AuctionManagement = 'AUC-MN-1',
  AuctionBidCreation = 'AUC-BS-1',
  BidCreation = 'BID-CT-1',
  TokenSend = 'TK-SD-1',
  TokenCreation = 'TK-CT-1',
  BidAccept = 'BID-AC-1',
  BidManagement = 'BID-MN-1',
  AskCreation = 'ASK-CT-1',
  AskManagement = 'ASK-MN-1',
  AskAccept = 'ASK-AC-1',
  AskPriceChange = 'ASK-PC-1',
  AskCancel = 'ASK-CN-1',
  CollectibleCreation = 'COL-CT-1',
  EndorsementCancel = 'TK-RX-1',
  EndorsementRequest = 'TK-RQ-1',
  EndorsementAccept = 'TK-EN-1',
  StampAdd = 'FOR-AD-1',
}

export interface Commission {
  _id: string;
  commissionId: CommissionTypes;
  description: string;
  type: string;
  value: string;
  blockchain: string;
}
