import React, { useEffect, useState } from 'react';
import { GQLUi_management as GQLUiManagement, GQLUser } from '../../../../types/graphql.schema';
import { useQuery as useGqlQuery } from '@apollo/client';
import TopCreatorCard from './index';
import { getTokens } from '../../../../gql/query/token';
import classes from '../../pages/HomePage/index.module.scss';
import { useUser } from '../../../../hooks/users';
import Link from 'next/link';

const TopCreatorWrapper = ({ creator, likesCount = 0 }: Props) => {
  const [visibleCreator, setVisibleCreator] = useState<GQLUser | undefined>();
  const [creationsNumber, setCreationsNumber] = useState<number>(0);

  useUser({
    skipQuery: false,
    variables: { query: { accountNumber: creator.itemID } },
    onSuccess: (data) => {
      setVisibleCreator(data.user);
    },
    onError: (e) => console.log(e),
  });

  const { data: tokensData, loading: tokensDataLoading } = useGqlQuery(getTokens, {
    errorPolicy: 'ignore',
    variables: {
      query: {
        deployed: {
          creator: visibleCreator?.walletAddress,
        },
        tokenID_exists: true,
      },
    },
  });

  useEffect(() => {
    if (!tokensDataLoading && tokensData) {
      const { tokens } = tokensData;
      setCreationsNumber(tokens.length);
    }
  }, [tokensDataLoading, tokensData]);

  if (!visibleCreator || !creator) return null;

  return (
    <Link href={`/user/${creator.itemID}`}>
      <a className={classes.mainWrapper}>
        <TopCreatorCard
          card={visibleCreator}
          image={creator?.assetID?.image}
          creationsNumber={creationsNumber}
          likesCount={likesCount}
        />
      </a>
    </Link>
  );
};

interface Props {
  creator: GQLUiManagement;
  likesCount?: number;
}

export default TopCreatorWrapper;
