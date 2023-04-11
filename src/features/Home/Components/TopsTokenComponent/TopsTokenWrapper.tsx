import React, { useState } from 'react';
import PropTypes from 'prop-types';
import TopTokenCard from './TopTokenCard/TopTokenCard';
import { GQLUi_management as GQLUiManagement } from '../../../../types/graphql.schema';
import { useQuery as useGqlQuery } from '@apollo/client';
import { getToken } from '../../../../gql/query/token';
import { IToken } from '../../../../types/Tokens/Token';
import classes from '../../pages/HomePage/index.module.scss';

const TopsTokenWrapper = ({ topsCard }: Props) => {
  const tokenID = topsCard?.itemID;
  const cardTag = topsCard?.tag;
  const [token, setToken] = useState<IToken>();
  useGqlQuery(getToken, {
    errorPolicy: 'ignore',
    variables: {
      query: { tokenID },
    },
    onCompleted: (data) => {
      setToken(data.token);
    },
  });
  return token ? (
    <div className={classes.mainWrapper}>
      <TopTokenCard card={token} cardTag={cardTag?.[0]} />
    </div>
  ) : null;
};

interface Props {
  topsCard: GQLUiManagement;
}

export default TopsTokenWrapper;
