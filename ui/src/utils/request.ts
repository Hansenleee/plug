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
    // withCredentials: true,
  };
});
