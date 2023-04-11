declare module 'next/config' {
  export interface PublicRuntimeConfig {
    services: {
      contentful: {
        space: string;
        accessToken: string;
      };
      dataUrl: string;
      authUrl: string;
      dataKey: string;
      mediaUrl: string;
      colUrl: string;
      ipfsUrl: string;
      realmAppId: string;
      realmPath: string;
      realmPathSuffix: string;
      realmAppApiKey: string;
      stitchHost: string;
      domain: string;
      secretPhrase: string;
    };
    ton: {
      endpoints: string[];
      contractAddress: {
        colRoot: string;
        sessionRoot: string;
      };
      surfNet: string;
      cookieLifeTime: string;
    };
    stage: string;
    contractsRepo: string;
    contractsRepoBSC: string;
    bcExplorer: string;
  }
}

