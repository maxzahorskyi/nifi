import { getSeries } from '../gql/query/series';
import { getToken } from '../gql/query/token';
import RealmUtil from './RealmUtil';
import { getUiManagement } from '../gql/query/uiManagement';
import getCorrectImageUrl from './GetCorrectImageUrlUtil';
import getConfig from 'next/config';
import { GQLUi_management as GQLUiManagement } from '../types/graphql.schema';
import { client } from '../pages/_app';

const REALM_APP_API_KEY = getConfig().publicRuntimeConfig.services.realmAppApiKey;

class ServerSideMetaTags {
  private static title: string | undefined;
  private static description: string | undefined;
  private static imgSrc: string | undefined;

  public static async getMetaDataTokenPage(context: any) {
    const isSeriesPage = context.resolvedUrl.indexOf('series') !== -1;
    let queryOptions: { query: any; variables: any } = {
      query: getToken,
      variables: { query: { tokenID: context.query.id } },
    };

    if (isSeriesPage) {
      queryOptions = {
        query: getSeries,
        variables: { query: { seriesID: context.query.id } },
      };
    }

    const { data } = await client.query(queryOptions);

    if (isSeriesPage) {
      return {
        title: data.series.raw.title || '',
        description: data.series.raw.description || '',
        media: data.series.raw.media || [],
      };
    }

    return {
      title: data.token.raw.title || '',
      description: data.token.raw.description || '',
      media: data.token.raw.media || [],
    };
  }

  public static async getMetaData(pageName: string) {
    const res = await fetch(RealmUtil.getEndpoint(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apiKey: `${REALM_APP_API_KEY}`,
      },
      body: JSON.stringify({
        query: (getUiManagement.loc && getUiManagement.loc?.source.body) || '',
        variables: { query: { moduleName: 'Page Metadata' } },
      }),
    });

    const json = await res.json();

    if (json.errors) {
      console.error(json.errors);
      throw new Error('Failed to fetch API');
    }

    await json.data.ui_managements.forEach((item: GQLUiManagement) => {
      if (item.moduleID?.page === pageName) {
        this.title = item.assetID?.assetTitle;
        this.description = item.assetID?.assetSubtitle;
        this.imgSrc = getCorrectImageUrl(item.assetID?.image);
      }
    });
    return {
      title: this.title || '',
      description: this.description || '',
      imgSrc: this.imgSrc || '',
    };
  }
}

export default ServerSideMetaTags;
