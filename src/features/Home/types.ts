import { ServerSideMetaTagsReturnType } from '../../types/ServerSideMetaTagsTypes';

export interface HomePageProps {
  meta: ServerSideMetaTagsReturnType;
}

export interface HomePageModule {
  recordID: string;
  moduleID: string;
  moduleName: string;
  moduleScope: 'universal' | 'desktop';
  moduleItemType: string;
  assetID?: string;
  assetTitle?: string;
  image?: string;
  visibilityStatus?: 'visible';
  itemID?: string;
  itemLink?: string;
}

export interface ClassifiedInterface {
  recordID: string;
  moduleID: string;
  moduleName: string;
  moduleScope: 'universal' | 'desktop';
  moduleItemType: string;
  assetID: string;
  assetTitle: string;
  image?: string;
  visibilityStatus?: 'visible';
  itemID?: string;
  itemLink?: string;
  MANAGEMENT: string;
}

export interface AssetInterface {
  assetID: string;
  assetTitle: string;
  assetSubtitle?: string;
  image: string;
  textLink?: string;
  imageLink: string;
  MANAGEMENT: string;
}
