class FeeUtil {
  private static coefficient = 100;

  public static toBlockchainFormat(fee: number) {
    return fee * FeeUtil.coefficient;
  }

  public static toReadableFormat(fee: number) {
    return fee / FeeUtil.coefficient;
  }
}

export default FeeUtil;
