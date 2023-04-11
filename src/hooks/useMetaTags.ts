import { useEffect, useState } from 'react';
import { useUiManagementData } from './new/useUiManagementData';
import { UiManagementType } from '../types/UiManagementType';
import { PageType } from '../types/pages';
import { GQLUi_management as GQLUiManagement } from '../types/graphql.schema';
import getCorrectImageUrl from '../utils/GetCorrectImageUrlUtil';

export const useMetaTags = (page: PageType) => {
  const { getUiManagementData } = useUiManagementData();

  const [title, setTitle] = useState<string>(page);
  const [description, setDescription] = useState<string>('');
  const [image, setImage] = useState<string>('');

  let metaTagsData: GQLUiManagement[] = getUiManagementData(UiManagementType.PAGE_METADATA);
  useEffect(() => {
    metaTagsData?.forEach((item) => {
      if (item.moduleID?.page === page.toLowerCase()) {
        setTitle(item.assetID?.assetTitle || '');
        setDescription(item.assetID?.assetSubtitle || '');
        setImage(getCorrectImageUrl(item.assetID?.image));
      }
    });
  }, [metaTagsData, page]);

  return { title, description, image };
};
