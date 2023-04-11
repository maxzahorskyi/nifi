import React from 'react';
import classes from '../TokenCard/index.module.scss';
import EverIcon from '../../../../../components/EverIcon';
import PersonIcon from '../../../../../../public/icons/person.svg';
import { useFormatAmount } from '../../../../../hooks/useFormatPrice';
import { TokenSaleType, TokenSaleTypeLabels } from '../../../../../types/Tokens/Token';
import { FrontStatus } from '../../../../../hooks/status/useFrontStatus';

const GetTokenHeader = ({
  currentPrice,
  numberOfCustomers,
  saleType,
  minimalBid,
  frontStatus,
}: Props) => {
  const getHeaderInfo = () => {
    const isAuction = frontStatus === FrontStatus.AUCTION;
    if ([FrontStatus.ON_SALE].includes(frontStatus as FrontStatus) && !currentPrice) return <div />;

    return (
      <div className={classes.offers}>
        <div className={classes.price}>
          <span>{isAuction ? 'current bid' : 'best bid'}</span>
          <span className={classes.price_number}>
            <EverIcon /> {useFormatAmount(currentPrice)}
          </span>
        </div>
        <div className={classes.price}>
          {isAuction ? (
            <>
              <span>minimal bid</span>
              <span className={classes.price_number}>
                <EverIcon /> {useFormatAmount(minimalBid)}
              </span>
            </>
          ) : (
            <>
              <span>active bids</span>
              <div>
                <PersonIcon className={classes.tonIconWrap} />
                <span style={{ fontSize: '18px' }}>{numberOfCustomers}</span>
              </div>
            </>
          )}
        </div>
      </div>
    );
  };

  const headerInfo = getHeaderInfo();

  if (!headerInfo || !frontStatus || saleType === TokenSaleType.Pending) return null;

  if (
    [FrontStatus.ACCEPTING_BIDS, FrontStatus.DRAFT, FrontStatus.FOREVER].includes(
      frontStatus as FrontStatus,
    ) &&
    !currentPrice
  )
    return null;

  return (
    <>
      <div className={classes.header}>
        <span className={classes.header__saleType}>
          {frontStatus && TokenSaleTypeLabels[saleType]}
        </span>
      </div>
      {headerInfo}
    </>
  );
};

interface Props {
  currentPrice: number | undefined;
  numberOfCustomers: number;
  saleType: TokenSaleType;
  minimalBid: number | undefined;
  isDesign?: boolean;
  frontStatus?: string;
}

export default GetTokenHeader;
