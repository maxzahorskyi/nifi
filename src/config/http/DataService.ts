import axios from 'axios';
import getConfig from 'next/config';
import generateService from './generateService';
import { message } from 'antd';

export const dataServiceUrl = getConfig().publicRuntimeConfig.services.dataUrl;

const axiosInstance = axios.create({
  baseURL: dataServiceUrl,
  headers: {
    API_KEY: getConfig().publicRuntimeConfig.services.dataKey,
  },
});

axiosInstance.interceptors.response.use(
  (response) => response.data.data,
  (error) => {
    const { response } = error;

    if (response.status === 400 && response.data.message) {
      message.error(response.data.message);
    }

    if (response.status === 409) {
      message.error('You can not create the token: such token already deployed!');
    }

    if (response.status === 500) {
      message.error('An unexpected server error occurred. Please try again later.');
    }

    throw error;
  },
);

const DataService = generateService(axiosInstance);

export default DataService;
