import { GQLCollection, GQLSeries, GQLToken } from '../../../types/graphql.schema';

class ActivityUtils {
  public static resolveTokenLinkByToken = (params: {
    token?: GQLToken;
    series?: GQLSeries;
    collection?: GQLCollection;
  }) => {
    if (params.series) {
      return `/token/${params?.series?.deployed?.type}/${params?.series.seriesID}/series`;
    }
    if (params.token) {
      return `/token/${params?.token?.deployed?.type}/${params?.token?.tokenID}`;
    }
    if (params.collection) {
      return `/collection/${params?.collection?.collectionID}`;
    }
    return '';
  };
}

export default ActivityUtils;
