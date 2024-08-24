import http from 'http';
import { URL } from 'url';
import qs from 'querystring';
import zlib from 'zlib';
import { ResponseDataInfo } from '../types';

export const getHost = (request: http.IncomingMessage) => {
  return request.headers.host;
};

export const getPath = (request: http.IncomingMessage) => {
  const { url } = request;

  if (url.startsWith('/')) {
    return url;
  }

  return new URL(request.url).pathname;
};

export const getContentType = (contentType: string) => {
  return contentType?.split(';')?.[0];
};

export const getRequestParams = (request: http.IncomingMessage, completeUrl: string) => {
  if (request.method.toLocaleUpperCase() === 'POST') {
    return new Promise((resolve) => {
      let requestBody = '';

      request.on('data', (data) => {
        requestBody += data;
      });

      request.on('end', () => {
        resolve(qs.parse(requestBody));
      });
    });
  }

  const url = new URL(completeUrl);

  return Promise.resolve(qs.parse(url.search.slice(1)));
};

export const getResponseData = (response: http.IncomingMessage) => {
  let responseData = '';
  let totalResponse = response;

  if (response.headers['content-encoding'] === 'gzip') {
    const gzip = zlib.createGunzip();

    response.pipe(gzip);
    totalResponse = gzip as unknown as http.IncomingMessage;
  }

  totalResponse.on('data', (data) => {
    responseData += data.toString('utf-8');
  });

  return {
    getData: () => responseData,
    response: totalResponse,
  };
};

export const getErrorResponseDataInfo = (): ResponseDataInfo => {
  return {
    statusCode: 408,
    headers: {
      date: '',
      'content-length': '',
      'content-type': '',
    },
    data: '',
  };
};
