const withTM = require('next-transpile-modules')(['freeton', '@eversdk/core']);
const withAntdLess = require('next-plugin-antd-less');

/**
 * @type {include('next').NextConfig}
 */
module.exports = withTM(
  withAntdLess({
    modifyVars: { '@primary-color': '#e82053' },
    webpack(config) {
      config.module.rules.push({
        test: /\.svg$/,
        use: ['@svgr/webpack'],
      });

      return config;
    },
    publicRuntimeConfig: {
      stage: process.env.STAGE,
      bcExplorer: process.env.BC_EXPLORER,
      services: {
        secretPhrase: process.env.SECRET_PHRASE,
        dataUrl: process.env.DATA_SERVICE_URL,
        authUrl: process.env.AUTH_SERVICE_URL,
        dataKey: process.env.DATA_APIKEY,
        mediaUrl: process.env.MEDIA_SERVICE_URL,
        colUrl: process.env.COL_SERVICE_URL,
        ipfsUrl: process.env.PINATA_GATEWAY,
        contentful: {
          space: process.env.CONTENTFUL_SPACE,
          accessToken: process.env.CONTENTFUL_TOKEN,
        },
        realmAppId: process.env.GRAPHQL_APPID,
        realmPath: process.env.GRAPHQL_PATH,
        realmPathSuffix: process.env.GRAPHQL_PATH_SUFFIX,
        realmAppApiKey: process.env.GRAPHQL_APIKEY,
        stitchHost: process.env.STITCH_HOST,
        domain: process.env.DOMAIN,
      },
      ton: {
        endpoints: (process.env.TON_ENDPOINTS ?? '').split('|').filter(Boolean),
        contractAddress: {
          colRoot: process.env.COL_ROOT_ADDR,
          sessionRoot: process.env.INI_DEBOT_ADDR,
        },
        surfNet: process.env.TON_SURF_NET_TYPE,
        cookieLifeTime: process.env.SESSION_FINISHER_TIME_MS,
      },
      contractsRepo: process.env.CONTRACTS_REPO,
      contractsRepoBSC: process.env.CONTRACTS_REPO_BSC,
    },
  }),
);
