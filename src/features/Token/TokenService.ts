import { Auth } from '../../auth/Auth';
import DataService from '../../config/http/DataService';
import {
  GQLAsk,
  GQLAskRaw,
  GQLAuction,
  GQLBid,
  GQLEndorsement,
  GQLSeries,
  GQLToken,
} from '../../types/graphql.schema';
import EncryptUtil from '../../utils/EncryptUtil';
import AbiFinder from '../../abis/abi-finder';
import { ContractFactory, ethers } from 'ethers';

enum Urls {
  Root = '/token',
  Bid = '/offer',
  Endorse = '/endorsement',
  art1 = '/token',
  for1 = '/token',
  art2 = '/series',
  collectible = '/collectible',
  stamp1 = '/token',
  endorsable = '/token',
  seal = '/token',
  Auction = '/auction',
  Ask = '/ask',
  CollectionCreate = '/collection/create',
  CollectionUpdate = '/collection/update',
}

export interface CreateTokenRes {
  insertOneToken?: GQLToken;
  updateOneToken?: GQLToken;
  insertOneSeries?: GQLSeries;
  updateOneSeries?: GQLSeries;
}

export enum ActionType {
  Create = 'create',
  ChangeOwner = 'changeOwner',
  Mint = 'mint',
  CreateCollection = 'createCollection',
}

export const saleType = ['Setup auction', 'Setup fixed price sale'];
export const saleSetup = ['Setup auction', 'Change offer price', 'Cancel sale offer'];

export enum ActionCodes {
  CreateToken = 'TK-CT',
  CreateSeries = 'SR-CT',
  Mint = 'TK-MT',
}

class TokenService {
  public static actionMessage: Record<ActionType, string> = {
    [ActionType.Create]: 'Token created',
    [ActionType.ChangeOwner]: 'Owner changed',
    [ActionType.Mint]: 'Token minted',
    [ActionType.CreateCollection]: 'Series created',
  };

  public static async createCollection(createCollectionDto: CreateCollectionDto) {
    const EncryptUtilTool = new EncryptUtil();
    const token = (await Auth.getInstance()).getAssertedTokenByWalletAddress(
      createCollectionDto.creator,
    );
    if (createCollectionDto.blockchain === 'binance') {
      const contract = await AbiFinder.findBNBRoot('stamp1', createCollectionDto.blockchain);
      const provider = await new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const factory = new ContractFactory(contract.abiFile.abi, contract.abiFile.byteCode, signer);
      const deployContract = await factory.deploy(
        createCollectionDto.title,
        createCollectionDto.about,
        createCollectionDto.title,
      );
      const formatData = {
        creator: createCollectionDto.creator,
        superType: contract.supertype,
        type: contract.longtype.split('.')[1],
        blockchain: 'binance',
        title: createCollectionDto.title,
        about: createCollectionDto.about,
        media: createCollectionDto.media,
        txHash: deployContract.deployTransaction.hash,
      };
      return DataService.post<{
        hash?: string;
      }>(`${Urls.CollectionCreate}/${token}`, {
        value: EncryptUtilTool.encrypt(JSON.stringify(formatData)),
      });
      // await deployContract.deployed();
      // console.log('deployContract.address', deployContract.address);
      // console.log('deployContract.deployTransaction', deployContract.deployTransaction);

      // const endorsementTokenContractAddress = {
      //   address: '0x3d7181c4A10d001818c598ea7F703B319B5cEFC1',
      // };
      //
      // const sealTokenContractAddress = {
      //   address: '0x25e9c1A45037fD29eF0753A6a3F34628871d4aC9',
      // };
      //
      // const endorsementTokenContract = new ethers.Contract(
      //   endorsementTokenContractAddress.address,
      //   contract.abiFile,
      //   signer,
      // );
      //
      // const sealTokenContract = new ethers.Contract(
      //   sealTokenContractAddress.address,
      //   SealAbi.abi,
      //   signer,
      // );
      //
      // const endorsementContractAddress = '0x7E4cb18A9E8Cd992931344663924ad98f41649Ef';
      //
      // const endorsementContract = new ethers.Contract(
      //   endorsementContractAddress,
      //   EndorsementAbi.abi,
      //   signer,
      // );

      // try {
      // const sealToken = await sealTokenContract.mint();
      // await sealToken.wait();
      // console.log('sealToken', sealToken);
      // const sealNftId = sealToken.id;
      // const endorsementToken = await endorsementTokenContract.mint();
      // await endorsementToken.wait();
      // console.log('endorsementToken', endorsementToken);
      // const endorsementNftId = endorsementToken.id;

      //     const approveTx = await sealTokenContract.approve(
      //       endorsementContractAddress,
      //       BigNumber.from(2),
      //     );
      //
      //     console.log('approveTx', approveTx);
      //
      //     const endorsementTx = await endorsementContract.endorse(
      //       endorsementTokenContractAddress.address,
      //       BigNumber.from(2),
      //       sealTokenContractAddress.address,
      //       BigNumber.from(2),
      //       BigNumber.from(1),
      //       {
      //         gasLimit: 5000000,
      //         // value: '100000000000000000',
      //       },
      //     );
      //     console.log('endorsementTx', endorsementTx);
      //   } catch (e) {
      //     console.log('error', e);
      //   }
      // }
    }
    return DataService.post<{
      hash?: string;
    }>(`${Urls.CollectionCreate}/${token}`, {
      value: EncryptUtilTool.encrypt(JSON.stringify(createCollectionDto)),
    });
  }

  public static async updateCollection(updateCollectionDto: UpdateCollectionDto) {
    const EncryptUtilTool = new EncryptUtil();
    const token = (await Auth.getInstance()).getAssertedTokenByWalletAddress(
      updateCollectionDto.creator,
    );
    return DataService.post<{
      hash?: string;
    }>(`${Urls.CollectionUpdate}/${token}`, {
      value: EncryptUtilTool.encrypt(JSON.stringify(updateCollectionDto)),
    });
  }

  public static createTokenInfo(createTokenDto: CreateTokenInfoDto) {
    const EncryptUtilTool = new EncryptUtil();
    return DataService.post<{
      hash?: string;
    }>(`${Urls[createTokenDto.seriesID ? 'Root' : createTokenDto.type]}/create`, {
      value: EncryptUtilTool.encrypt(JSON.stringify(createTokenDto)),
    });
  }

  public static mintToken(token: MintToken) {
    const EncryptUtilTool = new EncryptUtil();
    return DataService.post<{ token?: GQLToken }>(`${Urls.Root}/mint`, {
      value: EncryptUtilTool.encrypt(JSON.stringify(token)),
    });
  }

  public static merge(address: string) {
    const EncryptUtilTool = new EncryptUtil();
    return DataService.put<{ token?: GQLToken }>(`${Urls.Root}/merge/${address}`, {
      value: EncryptUtilTool.encrypt(JSON.stringify({ address })),
    });
  }

  public static requestEndorse(endorse: Endorsement) {
    const EncryptUtilTool = new EncryptUtil();
    return DataService.post<{ token?: GQLEndorsement }>(`${Urls.Endorse}/create`, {
      value: EncryptUtilTool.encrypt(JSON.stringify(endorse)),
    });
  }

  public static acceptEndorse(endorseID: string) {
    const EncryptUtilTool = new EncryptUtil();
    return DataService.post<{ token?: GQLEndorsement }>(`${Urls.Endorse}/success`, {
      value: EncryptUtilTool.encrypt(JSON.stringify(endorseID)),
    });
  }

  public static createBid(createBidDto: CreateBidDto) {
    const EncryptUtilTool = new EncryptUtil();
    return DataService.post<{ insertOneBid?: GQLBid }>(`${Urls.Bid}/create`, {
      value: EncryptUtilTool.encrypt(JSON.stringify(createBidDto)),
    });
  }

  public static createAuction(createAuctionDto: CreateAuctionDto) {
    const EncryptUtilTool = new EncryptUtil();
    return DataService.post<{ insertOneAuction?: GQLAuction }>(`${Urls.Auction}/create`, {
      value: EncryptUtilTool.encrypt(JSON.stringify(createAuctionDto)),
    });
  }

  public static createAsk(createAskDto: CreateAskDto) {
    const EncryptUtilTool = new EncryptUtil();
    return DataService.post<{ ask?: GQLAsk }>(`${Urls.Ask}/create`, {
      value: EncryptUtilTool.encrypt(JSON.stringify(createAskDto)),
    });
  }

  public static changeAsk(params: { ask: GQLAskRaw; askID: string }) {
    const { askID, ask } = params;
    const EncryptUtilTool = new EncryptUtil();
    return DataService.put<{ ask?: GQLAsk }>(`${Urls.Ask}/${askID}`, {
      value: EncryptUtilTool.encrypt(JSON.stringify(ask)),
    });
  }

  public static createAuctionBid(createAuctionBidDto: CreateAuctionBidDto) {
    const EncryptUtilTool = new EncryptUtil();
    return DataService.post<{ auction?: GQLAuction }>(`${Urls.Auction}/bid`, {
      value: EncryptUtilTool.encrypt(JSON.stringify(createAuctionBidDto)),
    });
  }

  public static async like(params: {
    tokenID?: string;
    accountNumber: number;
    walletAddress: string;
    type: TokenType;
    seriesID?: string;
  }) {
    const { tokenID, accountNumber, type, seriesID } = params;
    const token = (await Auth.getInstance()).getAssertedTokenByWalletAddress(params.walletAddress);
    const EncryptUtilTool = new EncryptUtil();
    return DataService.post(`${Urls[type]}/like/${token}`, {
      value: EncryptUtilTool.encrypt(
        JSON.stringify({
          tokenID: type !== TokenType.Art2 ? tokenID : undefined,
          seriesID,
          accountNumber,
        }),
      ),
    });
  }

  public static getLikes(params: { id: string; userAccountNumber?: number }) {
    const EncryptUtilTool = new EncryptUtil();
    return DataService.post('/likes', {
      value: EncryptUtilTool.encrypt(JSON.stringify({ ...params })),
    });
  }

  public static getGroupLikes(params: { ids: string[]; userAccountNumber?: number }) {
    const EncryptUtilTool = new EncryptUtil();
    return DataService.post('/likes/group', {
      value: EncryptUtilTool.encrypt(JSON.stringify({ ...params })),
    });
  }

  public static getGroupLikesByUserAccountNumbers(params: {
    requestedUserAccountNumbers: number[];
  }) {
    const EncryptUtilTool = new EncryptUtil();
    return DataService.post('/likes/user/group', {
      value: EncryptUtilTool.encrypt(JSON.stringify({ ...params })),
    });
  }

  public static getGroupLikesBycollectionIDs(params: { collectionIDs: string[] }) {
    const EncryptUtilTool = new EncryptUtil();
    return DataService.post('/likes/collection/group', {
      value: EncryptUtilTool.encrypt(JSON.stringify({ ...params })),
    });
  }

  public static send(params: { walletAddress: string; tokenID: string }) {
    const { walletAddress, tokenID } = params;
    const EncryptUtilTool = new EncryptUtil();
    return DataService.post(`${Urls.Root}/send`, {
      value: EncryptUtilTool.encrypt(JSON.stringify({ walletAddress, tokenID })),
    });
  }
}

export default TokenService;

export enum TokenType {
  Art1 = 'art1',
  Art2 = 'art2',
  Collectible = 'collectible',
  Stamp = 'stamp1',
  Seal = 'seal',
  Forever = 'for1',
}

export enum TokenTypeBSC {
  Stamp = 'stamp1',
  Seal = 'seal',
}

export const tokenTypeLabel = {
  [TokenType.Art1]: 'Sole Artwork',
  [TokenType.Art2]: 'Limited Artwork',
  [TokenType.Collectible]: 'Collectible',
  [TokenType.Stamp]: 'Sole Stamp',
  [TokenType.Seal]: 'Seal',
  [TokenType.Forever]: 'Forever',
};
export const rarityNumber = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

export interface CreateTokenInfoDto {
  title: string;
  description: string;
  media: MediaDto[];
  // images: MediaDto[]
  // videos: MediaDto[]
  numberOfEditions: number;
  type: TokenType;
  creator: string;
  superType: string;
  creatorFees: string;
  seriesID?: string;
  collectionID?: string;
  owner?: string;
  qualification: number;
  blockchain?: string;
  txHash?: string;
}

export interface MediaDto {
  subtitle: string;
  mimetype: string;
  hash: string; // sha3-256
  width: number; // px
  height: number; // px
  weight: number; // bytes
  role?: string;
}

export interface Auction {
  auctionId: string;
  address: string;
  creator: string; // address
  token: string; // address
  startBid: string; // nano ton
  stepBid: string; // nano ton
  startTime: number; // timestamp
  endTime: number; // timestamp
  finishBid: number | null;
  bids: Bid[];
}

export interface CreateAuctionDto {
  auctionCreator?: string;
  bidStep?: string;
  endTime?: number;
  showcaseFee?: string;
  startBid?: string;
  startTime?: number;
  superType?: string;
  tokenAddress?: string;
  tokenID?: string;
}

export interface CreateAskDto {
  askCreator: string;
  values?: AskValue[];
  currentAskValue?: string;
  endTime?: number;
  showcaseFee?: string;
  superType?: string;
  tokenAddress?: string;
  tokenID?: string;
}

export interface AskValue {
  askTime: number;
  askValue: string;
}

export interface CreateAuctionBidDto {
  bid: {
    bidCreator: string;
    bidValue: string;
  };
  auctionID: string;
}

export interface Bid {
  bidId: string;
  auctionId: string;
  creator: string; // address
  token: string; // address
  bider: string; // address
  value: string; // nano ton
}

export interface CreateBidDto {
  superType: string;
  tokenAddress: string;
  bidCreator: string;
  tokenID: string;
  endTime: number;
  bidValue: string;
}

export interface Offer {
  offerId: string;
  address: string;
  creator: string; // address
  token: string; // address
  price: string; // nano ton
  fee: string; // nano ton
  endTime: string; // timestamp
  status: OfferStatus;
}

export interface MintToken {
  creator: string;
  creatorFees: string;
  description: string;
  hash: string;
  media: Array<MediaDto>;
  // videos: Array<MediaDto>
  numberOfEditions: number;
  collectionID: string | undefined;
  owner: string;
  seriesID: string;
  superType: string;
  title: string;
  type: string;
  qualification: number;
  usersWhoShared: number[];
}

export interface Endorsement {
  creator: string;
  tokenID: string;
  value: string;
  sealID?: string;
  cornerSW?: boolean;
  cornerSE?: boolean;
  cornerNW?: boolean;
  cornerNE?: boolean;
  blockchain?: string;
  type?: string;
  endorsementID?: string;
  superType?: string;
  masterID?: string;
  expiresAt?: number;
}

export interface CreateCollectionDto {
  media: MediaDto[] | null;
  about: string;
  title: string;
  creator: string;
  creatorAccountNumber: number;
  collectionID?: string;
  blockchain: 'everscale' | 'binance';
}

export interface UpdateCollectionDto {
  media?: MediaDto[];
  about?: string;
  title?: string;
  collectionID: string;
  creator: string;
}

export enum OfferStatus {
  Created = 'created',
  Accepted = 'accepted',
  Pending = 'pending',
  Cancelled = 'cancelled',
}

export interface BaseActionDto {
  tokenId: string;
  address: string;
  userPublicKey: string; // sha-3
  owner: string; // address
  creator: string; // address
  hash: string; // sha-3
  message: {
    code: {
      actionCapture: string;
      additionalInfo: string;
      applicableContractType: string;
      code: string;
      description: string;
    };
    hash: string;
    resolution: string;
    superType: string;
    time: number; // timestamp
  };
  collection: string;
}

export interface UnknownActionDto extends BaseActionDto {
  action: undefined;
}

export interface ChangeOwnerActionDto extends BaseActionDto {
  action: ActionType.ChangeOwner;
  previousOwner: string;
  maximum: string;
}

export interface MintActionDto extends BaseActionDto {
  action: ActionType.Mint;
  maximum: string;
  creatorFees: string;
}
