class HashUtil {
  private static readonly prefix = '0x';

  public static removePrefix(hash: string) {
    if (HashUtil.hasPrefix(hash)) {
      return hash.slice(2);
    }

    return hash;
  }

  public static addPrefix(hash: string) {
    if (!HashUtil.hasPrefix(hash)) {
      return `${HashUtil.prefix}${hash}`;
    }

    return hash;
  }

  private static hasPrefix(hash: string) {
    return hash.startsWith(HashUtil.prefix);
  }
}

export default HashUtil;
