import React from 'react';
import { Result } from 'antd';
import CollectionCard from '../../pages/TokensPage/CollectionCard';
import { GQLSeries } from '../../../../types/graphql.schema';
import Loader from '../../../../components/Loader';
import MasonryWrapper from '../../pages/TokensPage/MasonryWrapper';

const Series = ({ serieses, isLoading, users, isDesign }: Props) => {
  if (isLoading) return <Loader text="Series is being loaded" />;
  if (!serieses?.length) return <Result title="There are no series yet" />;

  return (
    <MasonryWrapper theme={isDesign}>
      {serieses.map((series, index) => {
        const user = users?.find(
          (user: any) => (user?.walletAddress || user) === series?.deployed?.creator,
        );
        return (
          <div key={index}>
            <CollectionCard oneSeries={series} user={user} isDesign={isDesign} />
          </div>
        );
      })}
    </MasonryWrapper>
  );
};

export default Series;

interface Props {
  isDesign: boolean;
  users: any;
  serieses: GQLSeries[] | undefined;
  isLoading?: boolean;
}
