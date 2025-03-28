import http from 'http';
import { URL } from 'url';
import zlib from 'zlib';
import { ResponseDataInfo } from '../types';

export const getHost = (request: http.IncomingMessage) => {
  return request.headers.host;
};

export const getPath = (request: http.IncomingMessage) => {
  const { url } = request;
  let pathname = '';

  if (url.startsWith('/')) {
    pathname = url;
  } else {
    pathname = new URL(url).pathname;
  }

  return pathname.split('?')?.[0];
};

export const getContentType = (contentType: string) => {
  return contentType?.split(';')?.[0];
};

export const getRequestParams = (request: http.IncomingMessage, completeUrl: string) => {
  if (request.method.toLocaleUpperCase() === 'POST') {
    return request.body;
  }

  const url = new URL(completeUrl);

  return url.search.slice(1);
};

export const getResponseData = (response: http.IncomingMessage) => {
  const responseBuffer = [];
  let totalResponse = response;

  if (response.headers['content-encoding'] === 'gzip') {
    const gzip = zlib.createGunzip();

    response.pipe(gzip);
    totalResponse = gzip as unknown as http.IncomingMessage;
  }

  totalResponse.on('data', (data) => {
    responseBuffer.push(data);
  });

  return {
    getData: () => {
      if (response.headers['content-type'] === 'image/png') {
        return Buffer.concat(responseBuffer).toString('base64');
      }

      return Buffer.concat(responseBuffer).toString('utf-8');
    },
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
