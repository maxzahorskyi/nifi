class IdUtil {
  private static readonly separator = '-';

  public static split(ids: string | undefined): Ids {
    if (!ids) {
      return {
        tokenId: undefined,
        collectionID: undefined,
      };
    }

    if (IdUtil.hascollectionID(ids)) {
      const [collectionID, tokenId] = ids.split(IdUtil.separator).map((id) => +id);

      return {
        tokenId,
        collectionID,
      };
    }

    return {
      tokenId: +ids,
      collectionID: 0,
    };
  }

  private static hascollectionID(ids: string) {
    return ids.includes(IdUtil.separator);
  }
}

export default IdUtil;

interface Ids {
  tokenId: number | undefined;
  collectionID: number | undefined;
}
