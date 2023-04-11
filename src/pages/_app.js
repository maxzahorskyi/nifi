import 'reflect-metadata';
import '../styles/globals.scss';
import '../styles/globals-test.css';
import 'antd/dist/antd.css';
import '../config/i18n/i18nConfig';
import 'react-image-crop/dist/ReactCrop.css';
import React from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import App from '../features/app';
import { ApolloClient, ApolloProvider, HttpLink, InMemoryCache } from '@apollo/client';
import * as Realm from 'realm-web';
import getConfig from 'next/config';
import RealmUtil from '../utils/RealmUtil';
import { getUiManagement } from '../gql/query/uiManagement';
import NextApp from 'next/app';
import getCorrectImageUrl from '../utils/GetCorrectImageUrlUtil';
import MetaTags from '../features/Token/components/MetaTags';

const REALM_APP_ID = getConfig().publicRuntimeConfig.services.realmAppId;
const REALM_APP_API_KEY = getConfig().publicRuntimeConfig.services.realmAppApiKey;

export const realm = new Realm.App({
  id: REALM_APP_ID,
  apiKey: REALM_APP_API_KEY,
  baseUrl: `https://${getConfig().publicRuntimeConfig.services.stitchHost}`,
  skipLocationRequest: true,
});

const getValidAccessToken = async () => {
  if (!realm.currentUser) {
    await realm.logIn(Realm.Credentials.apiKey(REALM_APP_API_KEY));
  } else {
    await realm.currentUser.refreshCustomData();
  }

  return realm.currentUser.accessToken;
};

export const client = new ApolloClient({
  link: new HttpLink({
    uri: RealmUtil.getEndpoint(),
    fetch: async (uri, options) => {
      const accessToken = await getValidAccessToken();
      options.headers.Authorization = `Bearer ${accessToken}`;

      return fetch(uri, options);
    },
  }),
  cache: new InMemoryCache(),
  resolvers: {
    TokenQueryInput: {
      tokens(parent, args, context, info) {
        console.log(parent, args, context, info);
        return 1;
      },
    },
  },
});

export const queryClient = new QueryClient();

const Root = ({ Component, pageProps }) => {
  return (
    <ApolloProvider client={client}>
      <QueryClientProvider client={queryClient}>
        <MetaTags {...pageProps.defaultMetaTags} />
        <App Component={Component} pageProps={pageProps} />
      </QueryClientProvider>
    </ApolloProvider>
  );
};

Root.getInitialProps = async (appContext) => {
  const { data } = await client.query({
    query: getUiManagement,
    variables: { query: { moduleName: 'Page Metadata' } },
  });
  const appProps = await NextApp.getInitialProps(appContext);

  let pageQueryParams = appContext.router.query;
  let defaultMetaTags = {};

  data.ui_managements.forEach((item) => {
    if (item.moduleID?.page === 'global') {
      defaultMetaTags = {
        title: item.assetID?.assetTitle || '',
        description: item.assetID?.assetSubtitle || '',
        imgSrc: getCorrectImageUrl(item.assetID?.image),
      };
    }
  });

  appProps.pageProps = { defaultMetaTags, pageQueryParams };

  return { ...appProps };
};

export default Root;
