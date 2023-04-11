class DateUtil {
  public static convertToISODateString(date: Date | undefined) {
    if (!date) {
      return undefined;
    }

    return date.toISOString().split('T')[0];
  }

  public static convertToISOTimeString(date: Date | undefined) {
    if (!date) {
      return undefined;
    }

    return date.toISOString().split('T')[1]?.slice(0, -5);
  }
}

export default DateUtil;
