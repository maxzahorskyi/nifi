import EncryptUtil from './EncryptUtil';
import DataService from '../config/http/DataService';

const saveSession = (params: { confirmationHash: string; cookiesHash: string }) => {
  const EncryptUtilTool = new EncryptUtil();
  return DataService.post('session/update', {
    value: EncryptUtilTool.encrypt(JSON.stringify(params)),
  });
};

export default saveSession;
