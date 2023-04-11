import { ServerSideMetaTagsReturnType } from '../../../types/ServerSideMetaTagsTypes';
import { GQLCol1, GQLSeries, GQLToken, GQLTokenCol } from '../../../types/graphql.schema';

export interface TokensPageProps {
  meta: ServerSideMetaTagsReturnType;
}

export interface TokenPageProps {
  token: GQLToken | undefined;
  isColPage?: boolean;
  tokenCol?: GQLTokenCol;
  meta: { title: string; description: string; media: [] };
}

export interface TokenPageMingProps {
  series: GQLSeries | undefined;
  col1?: GQLCol1;
  isColPage?: boolean;
  meta: { title: string; description: string; media: [] };
}
