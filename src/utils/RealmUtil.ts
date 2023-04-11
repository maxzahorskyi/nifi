import getConfig from 'next/config';

class RealmUtil {
  public static getEndpoint(): string {
    const config = getConfig().publicRuntimeConfig.services;
    const { realmPath, realmAppId, realmPathSuffix } = config;

    return realmPath + realmAppId + realmPathSuffix;
  }
}

export default RealmUtil;
