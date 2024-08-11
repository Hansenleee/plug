import { message } from 'antd';
import axios from 'axios';
import { BASE_API_HOST } from '../constants';

axios.interceptors.request.use((config) => {
  let { url } = config;

  if (config.url?.startsWith('/')) {
    url = `${BASE_API_HOST}${config.url}`;
  }

  return {
    ...config,
    url,
    withCredentials: true,
  };
});

axios.interceptors.response.use((response) => {
  const responseData = response.data;

  if (responseData.code === 0) {
    return responseData.data;
  }

  message.error(`${responseData.message}_${responseData.code}`);
  throw Error(responseData);
});
