class AddressUtil {
  public static shorten(address: string | undefined) {
    if (!address) {
      return '';
    }

    if (!AddressUtil.isAddress(address)) {
      return address;
    }

    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }

  public static isAddress(maybeAddress: string | undefined) {
    if (!maybeAddress) {
      return false;
    }

    return maybeAddress.startsWith('0:') && maybeAddress.length === 66;
  }
}

export default AddressUtil;
