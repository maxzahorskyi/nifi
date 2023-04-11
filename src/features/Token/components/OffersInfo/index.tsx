import React from 'react';
import Properties from '../../../../components/Properties';
import classes from '../AuctionInfo/index.module.scss';
import PersonIcon from '../../../../../public/icons/personIcon.svg';
import EverIcon from '../../../../components/EverIcon';
import TimeUtil from '../../../../utils/TimeUtil';
import ArrowRightIcon from '../../../../../public/icons/arrowRight.svg';
import cn from 'classnames';
import { useFormatAmount } from '../../../../hooks/useFormatPrice';
import { TokenSaleInfo } from '../../../../types/Tokens/Token';

const OffersInfo = ({ saleInfo, className }: Props) => {
  const { numberOfCustomers, bestPrice, endOfferTime } = saleInfo;

  return (
    <Properties
      className={cn(classes.currentProperties, classes.offersInfo, className)}
      items={[
        {
          label: 'best current bid',
          value: (
            <span className={classes.currentProperties__textPinkWithIcon}>
              <EverIcon /> {useFormatAmount(bestPrice) ?? 0}
            </span>
          ),
        },
        {
          label: 'best bid expires in',
          value: TimeUtil.getTimeLeft(endOfferTime) ?? 'No time left',
        },
        {
          label: 'current bids',
          value: (
            <span className={classes.currentProperties__personIcon}>
              <PersonIcon /> {numberOfCustomers}
            </span>
          ),
        },
      ]}
      renderItemLabel={(item) =>
        item && (
          <span className={classes.textWithIcon}>
            <ArrowRightIcon /> {item.label}:
          </span>
        )
      }
      renderItemValue={(item) => item && item.value}
      labelProps={{
        className: classes.currentProperties__label,
      }}
      valueProps={{
        className: classes.currentProperties__valuePink,
      }}
    />
  );
};

export default OffersInfo;

interface Props {
  saleInfo: TokenSaleInfo;
  canAcceptOffer: boolean;
  className?: string;
}
