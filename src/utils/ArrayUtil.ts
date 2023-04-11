class ArrayUtil {
  public static getUniqueValues<Item>(array: Item[] | undefined) {
    if (!array) {
      return [];
    }

    return Array.from(new Set(array));
  }
}

export default ArrayUtil;
