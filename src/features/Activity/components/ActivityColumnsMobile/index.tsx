import {
  GQLAction,
  GQLActionTokenAttribute,
  GQLCollection,
  GQLSeries,
  GQLToken,
} from '../../../../types/graphql.schema';
import TokenInfo from '../TokenInfo';
import classes from '../../pages/ActivityPage/index.module.scss';
import Actor from '../Actor';
import TokenService, { ActionType } from '../../../Token/TokenService';
import React from 'react';

const ActivityColumnsMobile = (
  t: any,
  tokens: GQLToken[] | undefined,
  seriesArray: GQLSeries[] | undefined,
  collectionArray: GQLCollection[] | undefined,
) => {
  return [
    {
      key: 'Token ',
      render: (action: any) => (
        <TokenInfo
          action={action}
          seriesArray={seriesArray}
          tokens={tokens}
          collectionArray={collectionArray}
          isMobile
        />
      ),
    },

    {
      key: 'action',
      render: (action: any) => {
        if (!action.actionAttributes?.actionCapture) {
          return action.actionAttributes?.actionCapture;
        }
        const actorField = action.message?.actionCode?.actorField;
        const props: string[] = actorField?.split('.') || ['tokenAttributes', 'creator'];

        return (
          <span className={classes.authorRow}>
            <Actor
              address={
                action?.[props[0] as keyof GQLAction]?.[
                  props[1] as keyof GQLActionTokenAttribute
                ] || ''
              }
            />
            <span>
              {TokenService.actionMessage[action.actionAttributes?.actionCapture as ActionType] ??
                action.actionAttributes?.actionCapture}
            </span>
          </span>
        );
      },
    },
  ];
};

export default ActivityColumnsMobile;
