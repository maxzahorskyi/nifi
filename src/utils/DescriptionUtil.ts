class DescriptionUtil {
  public static shorten(description: string | undefined, maxLength = 42) {
    if (!description) {
      return '';
    }

    return description.length > maxLength
      ? `${description.substring(0, maxLength)}...`
      : description;
  }
}

export default DescriptionUtil;
