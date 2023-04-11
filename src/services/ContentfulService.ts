import { createClient } from 'contentful';
import getConfig from 'next/config';

const contentfulConfig = getConfig().publicRuntimeConfig.services.contentful;
export const client = createClient(contentfulConfig);

class ContentfulService {
  public static getEntry(id: string) {
    return client.getEntry(id);
  }

  public static getEntries(typeId: string) {
    return client.getEntries({
      content_type: typeId,
    });
  }
}

export default ContentfulService;
