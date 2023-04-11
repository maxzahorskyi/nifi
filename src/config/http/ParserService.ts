import axios from 'axios';
import generateService from './generateService';
import { dataServiceUrl } from './DataService';

export const parserServiceUrl = `${dataServiceUrl}/rpc-deprecated`;

const axiosInstance = axios.create({
  baseURL: parserServiceUrl,
});

axiosInstance.interceptors.response.use((response) => response.data.data.result);

/**
 * @deprecated in favor of DataService
 */
const ParserService = generateService(axiosInstance);

export default ParserService;
