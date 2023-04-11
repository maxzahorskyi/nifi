import { ExceptionStatusType } from 'antd/lib/result';

class UIExceptionUtil {
  public static getStatus(errorStatus: number | undefined): ExceptionStatusType {
    if (!errorStatus) {
      return 500;
    }

    if ([403, 404, 500].includes(errorStatus)) {
      return errorStatus as ExceptionStatusType;
    }

    return 500;
  }
}

export default UIExceptionUtil;
