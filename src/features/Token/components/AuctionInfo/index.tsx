import React from 'react';
import { useTranslation } from 'react-i18next';
import Properties from '../../../../components/Properties';
import classes from './index.module.scss';
import PersonIcon from '../../../../../public/icons/personIcon.svg';
import EverIcon from '../../../../components/EverIcon';
import TimeUtil from '../../../../utils/TimeUtil';
import ArrowRightIcon from '../../../../../public/icons/arrowRight.svg';
import cn from 'classnames';
import { useFormatAmount } from '../../../../hooks/useFormatPrice';
import { TokenSaleInfo } from '../../../../types/Tokens/Token';

const AuctionInfo = ({ saleInfo, className }: Props) => {
  const { t } = useTranslation();

  const { numberOfCustomers, currentPrice, startTime, endTime, step, startPrice } = saleInfo;

  const auctionStatus = (() => {
    if (startTime && TimeUtil.isInThePast(startTime)) {
      return AuctionStatus.Started;
    }

    if (endTime && TimeUtil.isInThePast(endTime)) {
      return AuctionStatus.Finished;
    }

    return AuctionStatus.Pending;
  })();

  const timeProperties = (() => {
    if (auctionStatus === AuctionStatus.Started || auctionStatus === AuctionStatus.Finished) {
      return [
        {
          label: t('TokenPage.TimeLeft'),
          value: TimeUtil.getTimeLeft(endTime) ?? 'No time left',
        },
      ];
    }
    if (auctionStatus === AuctionStatus.Pending) {
      return [
        {
          label: t('TokenPage.TimeLeft'),
          value: 'closing',
        },
      ];
    }

    return [
      {
        label: 'starts in',
        value: startTime
          ? TimeUtil.getTimeLeft(startTime) ?? 'a moment'
          : 'Start time is not specified',
      },
      {
        label: 'auction duration',
        value:
          startTime && endTime
            ? TimeUtil.getTimeLeft(endTime, startTime)
            : 'Duration is not specified',
      },
    ];
  })();

  return (
    <Properties
      className={cn(classes.currentProperties, classes.currentPropertiesMobileWrap, className)}
      items={[
        ...timeProperties,
        {
          label: t('TokenPage.CurrentBid'),
          value: (
            <span className={classes.currentProperties__textWithIcon}>
              <EverIcon /> {useFormatAmount(currentPrice) ?? 0}
            </span>
          ),
        },
        {
          label: 'bidders',
          value: (
            <span className={classes.currentProperties__personIcon}>
              <PersonIcon /> {numberOfCustomers}
            </span>
          ),
        },
        {
          label: 'minimal bid',
          value: (
            <span className={classes.currentProperties__textWithIcon}>
              <EverIcon /> {useFormatAmount(startPrice) ?? 0}
            </span>
          ),
        },
        {
          label: 'auction step',
          value: (
            <span className={classes.currentProperties__textWithIcon}>
              <EverIcon /> {useFormatAmount(step)}
            </span>
          ),
        },
      ]}
      renderItemLabel={(item) => (
        <span className={classes.textWithIcon}>
          <ArrowRightIcon /> {item.label}:
        </span>
      )}
      renderItemValue={(item) => item.value}
      labelProps={{
        className: classes.currentProperties__label,
      }}
      valueProps={{
        className: classes.currentProperties__value,
      }}
    />
  );
};

export default AuctionInfo;

interface Props {
  saleInfo: TokenSaleInfo;
  className?: string;
}

enum AuctionStatus {
  Pending = 'Pending',
  Finished = 'Finished',
  Started = 'Started',
}
