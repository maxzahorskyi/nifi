import { OfferStatus } from '../TokenService';
import TimeUtil from '../../../utils/TimeUtil';
import { IBid } from '../../../types/Tokens/TokenInfo';
import { GQLAsk, GQLAuction, GQLBid, GQLEndorsement } from '../../../types/graphql.schema';
import TonUtil from '../../../utils/TonUtil';
import { TokenSaleInfo, TokenSaleType } from '../../../types/Tokens/Token';

interface Props {
  auction?: GQLAuction;
  bids?: GQLBid[];
  ask?: GQLAsk;
  endorsement?: GQLEndorsement;
  isAddedToForever?: boolean;
}
class TokenUtil {
  public static getSaleInfo(params: Props): TokenSaleInfo {
    return {
      saleType: TokenUtil.getSaleType(params),
      isExpired: TokenUtil.isExpired(params),
      endTime: TokenUtil.getEndTime(params) || 0,
      endOfferTime: TokenUtil.getEndTime({ ...params, type: 'offer' }) || 0,
      startTime: TokenUtil.getStartTime(params.auction) || 0,
      currentPrice: TokenUtil.getPrice({ ...params, type: 'current' }),
      bestPrice: TokenUtil.getPrice({ ...params, type: 'best' }),
      numberOfCustomers: TokenUtil.getNumberOfCustomers(params),
      step: TokenUtil.getStep({ auction: params.auction }),
      startPrice: TokenUtil.getPrice({ ...params, type: 'start' }),
      bestOffer: TokenUtil.getBestOffer(params.bids as IBid[]),
    };
  }

  public static getSaleType(params: Props) {
    const { auction, bids, ask, endorsement, isAddedToForever } = params;
    if (isAddedToForever) {
      return TokenSaleType.Forever;
    }
    if (endorsement) {
      return TokenSaleType.Endorsement;
    }

    if (
      auction &&
      auction?.deployed?.endTime &&
      !TimeUtil.isInThePast(+auction?.deployed?.endTime)
    ) {
      return TokenSaleType.Auction;
    }

    if (ask && ask?.deployed?.endTime && !TimeUtil.isInThePast(+ask?.deployed?.endTime)) {
      return TokenSaleType.Ask;
    }

    if (bids && bids.length) {
      const bestOffer = TokenUtil.getBestOffer(bids as IBid[]);

      if (
        bestOffer &&
        !TimeUtil.isInThePast(Number(bestOffer.deployed?.endTime)) &&
        bestOffer.deployed?.status === OfferStatus.Created
      ) {
        return TokenSaleType.Offer;
      }
    }

    return TokenSaleType.Pending;
  }

  private static isExpired(params: Props) {
    const { auction, bids, ask } = params;
    const saleType = TokenUtil.getSaleType(params);

    if (saleType === TokenSaleType.Auction && auction) {
      return TimeUtil.isInThePast(+(auction?.deployed?.endTime || 0));
    }

    if (saleType === TokenSaleType.Ask && ask) {
      return TimeUtil.isInThePast(+(ask?.deployed?.endTime || 0));
    }

    if (saleType === TokenSaleType.Offer && bids) {
      const bestOffer = TokenUtil.getBestOffer(bids as IBid[]);

      if (!bestOffer) {
        return false;
      }

      return TimeUtil.isInThePast(Number(bestOffer.deployed.endTime));
    }

    return false;
  }

  private static getEndTime(params: {
    auction?: GQLAuction;
    bids?: GQLBid[];
    ask?: GQLAsk;
    type?: 'offer';
  }) {
    const { auction, bids, ask, type } = params;
    const saleType = TokenUtil.getSaleType(params);

    if (type === 'offer' && ask) {
      const bestOffer = TokenUtil.getBestOffer(bids as IBid[]);
      return Number(bestOffer?.deployed.endTime);
    }

    if (saleType === TokenSaleType.Auction && auction) {
      return +(auction.deployed?.endTime || '');
    }

    if (saleType === TokenSaleType.Ask && ask) {
      return +(ask.deployed?.endTime || '');
    }

    if (saleType === TokenSaleType.Offer && bids) {
      const bestOffer = TokenUtil.getBestOffer(bids as IBid[]);
      return Number(bestOffer?.deployed.endTime);
    }

    return undefined;
  }

  private static getStartTime(auction?: GQLAuction) {
    const saleType = TokenUtil.getSaleType({ auction });

    if (saleType === TokenSaleType.Auction && auction) {
      return +(auction.deployed?.startTime || 0);
    }

    return undefined;
  }

  private static getPrice(params?: {
    auction?: GQLAuction;
    bids?: GQLBid[];
    ask?: GQLAsk;
    type: 'best' | 'current' | 'start';
  }) {
    const saleType = TokenUtil.getSaleType({
      auction: params?.auction,
      bids: params?.bids,
      ask: params?.ask,
    });

    if (saleType === TokenSaleType.Auction && params?.auction) {
      if (params?.type === 'start') {
        return TonUtil.convertNanoTonToTon(+(params?.auction.deployed?.startBid || 0));
      }

      const lastBidValue =
        params?.auction.deployed?.bids?.[params?.auction.deployed?.bids.length - 1]?.bidValue;
      return lastBidValue ? TonUtil.convertNanoTonToTon(+lastBidValue) : undefined;
    }

    if (saleType === TokenSaleType.Offer && params?.bids) {
      const bestOffer = TokenUtil.getBestOffer(params?.bids as IBid[], {
        alwaysIncludeExpired: params?.type === 'best',
      });
      return TonUtil.convertNanoTonToTon(+(bestOffer?.deployed.bidValue ?? 0));
    }

    if (saleType === TokenSaleType.Ask && params?.ask) {
      if (params.type === 'best') {
        const bestOffer = TokenUtil.getBestOffer(params?.bids as IBid[], {
          alwaysIncludeExpired: params?.type === 'best',
        });
        return TonUtil.convertNanoTonToTon(+(bestOffer?.deployed.bidValue ?? 0));
      }
      return TonUtil.convertNanoTonToTon(+(params?.ask?.deployed?.currentAskValue ?? 0));
    }

    return undefined;
  }

  private static getActiveOffers(offers: IBid[]) {
    return offers?.filter(
      (offer) =>
        !TimeUtil.isInThePast(Number(offer.deployed?.endTime)) &&
        offer.deployed?.status === OfferStatus.Created,
    );
  }

  private static getBestOffer(offers: IBid[], options: { alwaysIncludeExpired?: boolean } = {}) {
    const activeOffers = TokenUtil.getActiveOffers(offers);

    const suitableOffers =
      activeOffers?.length === 0 || options.alwaysIncludeExpired ? offers : activeOffers;

    return suitableOffers?.reduce<IBid | undefined>((acc, offer) => {
      if (!acc || parseInt(offer.deployed?.bidValue, 10) > parseInt(acc.deployed?.bidValue, 10)) {
        return offer;
      }

      return acc;
    }, undefined);
  }

  private static getNumberOfCustomers(params: { auction?: GQLAuction; bids?: GQLBid[] }) {
    const { auction, bids } = params;
    const saleType = TokenUtil.getSaleType({ auction, bids });

    if (saleType === TokenSaleType.Auction && auction) {
      return auction.deployed?.bids?.length || 0;
    }

    if (saleType === TokenSaleType.Offer && bids) {
      return TokenUtil.getActiveOffers(bids as IBid[]).length;
    }

    return 0;
  }

  private static getStep(params: { auction?: GQLAuction }) {
    const { auction } = params;
    const saleType = TokenUtil.getSaleType({ auction });

    if (saleType === TokenSaleType.Auction && auction) {
      return TonUtil.convertNanoTonToTon(+(auction?.deployed?.bidStep || 0));
    }

    return 0;
  }
}

export default TokenUtil;
