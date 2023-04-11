import {
  GQLAction,
  GQLActionTokenAttribute,
  GQLCollection,
  GQLSeries,
  GQLToken,
} from '../../../../types/graphql.schema';
import TokenInfo from '../TokenInfo';
import Actor from '../Actor';
import TokenService, { ActionType } from '../../../Token/TokenService';
import React from 'react';
import { Column } from '../../../../components/Table';
import parseTokenId from '../../../../utils/TokenUtil';
import formatDistance from 'date-fns/formatDistance';
import BlockchainIcon from '../../../../components/BlockchainIcon';
import classes from '../../pages/ActivityPage/index.module.scss';

const ActivityColumnsDesktop = (
  t: any,
  tokens: GQLToken[] | undefined,
  seriesArray: GQLSeries[] | undefined,
  collectionArray: GQLCollection[] | undefined,
) => {
  const activitiesColumns: Column<GQLAction>[] = [
    {
      title: t('ActivityPage.Token'),
      key: 'Token',
      render: (action: any) => (
        <TokenInfo
          action={action}
          seriesArray={seriesArray}
          tokens={tokens}
          collectionArray={collectionArray}
        />
      ),
    },
    {
      title: t('ActivityPage.Edition'),
      key: 'Edition',
      render: (action) => {
        const token: GQLToken | undefined = tokens?.find((item) => {
          return (
            item.tokenID === action.tokenAttributes?.tokenID ||
            item.raw?.seriesID === action.tokenAttributes?.tokenID
          );
        });

        const series: GQLSeries | undefined = seriesArray?.find((item) => {
          return item.seriesID === action.tokenAttributes?.seriesID?.seriesID;
        });

        const collection: GQLCollection | undefined = collectionArray?.find((item) => {
          return item.collectionID === action.tokenAttributes?.collectionID;
        });

        const checkSeries = action.actionAttributes?.actionCapture === 'Series created';
        const checkCT = action.message?.actionCode?.code === 'COL-CT';

        let blockchain =
          token?.deployed?.blockchain ||
          collection?.deployed?.blockchain ||
          series?.deployed?.blockchain;

        return (
          <>
            <BlockchainIcon
              blockchain={blockchain as 'binance' as 'everscale'}
              className={classes.edition__icon}
              imgClassName={classes.edition__icon__img}
            />
            {checkSeries && <span>series</span>}
            {checkCT && <span>collection</span>}
            {!checkSeries && !checkCT && (
              <>
                {token?.deployed?.type === 'art2'
                  ? parseTokenId(token.tokenID as string).tokenId
                  : 1}
                {' of '}
                {token?.deployed?.type === 'art2'
                  ? token?.deployed?.seriesID?.deployed?.maximum
                  : 1}
              </>
            )}
          </>
        );
      },
    },
    {
      title: 'Activity',
      key: 'action',
      render: (action) => {
        if (!action.actionAttributes?.actionCapture) {
          return action.actionAttributes?.actionCapture;
        }

        return (
          TokenService.actionMessage[action.actionAttributes?.actionCapture as ActionType] ??
          action.actionAttributes?.actionCapture
        );
      },
    },
    {
      title: 'User',
      key: 'collector',
      render: (action) => {
        const actorField = action.message?.actionCode?.actorField;
        const props: string[] = actorField?.split('.') || ['tokenAttributes', 'creator'];

        return (
          <span
            style={{
              display: 'flex',
              alignItems: 'center',
            }}>
            <Actor
              address={
                action?.[props[0] as keyof GQLAction]?.[
                  props[1] as keyof GQLActionTokenAttribute
                ] || ''
              }
            />
          </span>
        );
      },
    },
    {
      title: t('ActivityPage.Date'),
      key: 'Date',
      render: ({ message }) => {
        if (message?.time) {
          return formatDistance(new Date(message?.time ? message.time * 1000 : 1), new Date(), {
            addSuffix: true,
          });
        }
        return 1;
      },
    },
  ];

  return activitiesColumns;
};

export default ActivityColumnsDesktop;
