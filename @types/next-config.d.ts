/// <reference types="next" />
/// <reference types="next/types/global" />
declare module 'next/config' {
  interface ServerRuntimeConfig {

  }

  export interface PublicRuntimeConfig {

  }

  type Config = {
    serverRuntimeConfig: ServerRuntimeConfig,
    publicRuntimeConfig: PublicRuntimeConfig,

  }

  declare function getConfig(): Config
  export default getConfig
}
