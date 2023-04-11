import React, { useEffect } from 'react';
import classes from './index.module.scss';
import cn from 'classnames';
import { TonSurfModalTypes } from '../../../../utils/TonSurfUtil';
import { OfferStatus } from '../../TokenService';
import { ITokenInfoDto } from '../../../../types/Tokens/TokenInfo';

const TransactionStatus = ({ type, status, className, token }: Props) => {
  const typeAudit =
    type === TonSurfModalTypes.createAuction ||
    type === TonSurfModalTypes.auctionManagement ||
    type === TonSurfModalTypes.createAsk ||
    type === TonSurfModalTypes.askManagement ||
    type === TonSurfModalTypes.bidManagement ||
    type === TonSurfModalTypes.acceptBid;

  return (
    <div
      className={cn(
        classes.wrapper,
        className,
        typeAudit && classes.wrapperSurf,
        (!status || status === OfferStatus.Created) && classes.wrapperExtraton,
      )}>
      <div className={classes.circleWrapper}>
        <div
          className={cn(
            classes.circle,
            (!status || status === OfferStatus.Created || typeAudit) && classes.pink,
          )}>
          1
        </div>
        <div
          className={cn(
            classes.line,
            (!status || status === OfferStatus.Created || typeAudit) && classes.pink,
          )}
        />
        <div
          className={cn(
            classes.circle,
            (status === OfferStatus.Created ||
              type === TonSurfModalTypes.auctionManagement ||
              type === TonSurfModalTypes.askManagement ||
              type === TonSurfModalTypes.acceptBid) &&
              classes.pink,
          )}>
          2
        </div>
      </div>
      {type === TonSurfModalTypes.createAuction ||
      type === TonSurfModalTypes.createAsk ||
      type === TonSurfModalTypes.bidManagement ||
      !status ? (
        <div className={classes.steps}>Transaction 1 of 2</div>
      ) : type === TonSurfModalTypes.auctionManagement ||
        type === TonSurfModalTypes.askManagement ||
        type === TonSurfModalTypes.acceptBid ||
        status === OfferStatus.Created ? (
        <div className={classes.steps}>Transaction 2 of 2</div>
      ) : (
        <div className={classes.textWrapper}>
          Transaction will be executed in two steps, you need to authorize two payments
        </div>
      )}
    </div>
  );
};

export default TransactionStatus;

type Props = {
  token?: ITokenInfoDto;
  type?: any;
  status?: string;
  className?: any;
};
