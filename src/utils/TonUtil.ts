class TonUtil {
  public static convertTonToNanoTon(ton: number, blockchain?: 'binance' | 'everscale') {
    if (blockchain && blockchain === 'binance') {
      return ton * 10 ** 18;
    }
    return ton * 10 ** 9;
  }

  public static convertNanoTonToTon(ton: number, blockchain?: 'binance' | 'everscale') {
    if (blockchain && blockchain === 'binance') {
      return ton / 10 ** 18;
    }
    return ton / 10 ** 9;
  }
}

export default TonUtil;
