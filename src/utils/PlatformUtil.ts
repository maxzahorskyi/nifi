class PlatformUtil {
  /**
   * @see https://stackoverflow.com/a/19883965/14067484
   * @description Returns true if user is using one of the following platforms:
      Macintosh,
      MacIntel: Intel processor (2005),
      MacPPC: PowerPC processor,
      Mac68K: 68000 processor,
   */
  public static isMacOS() {
    return PlatformUtil.isOnClientSide() && navigator.platform.startsWith('Mac');
  }

  public static getHardResetCombination() {
    if (PlatformUtil.isMacOS()) {
      return 'Command + Shift + R';
    }

    return 'Ctrl + Shift + R';
  }

  public static isOnClientSide() {
    return typeof window !== 'undefined';
  }
}

export default PlatformUtil;
