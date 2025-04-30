import http, { RequestOptions, IncomingMessage } from 'http';
import https from 'https';

export const isPromisify = (returnValue: unknown) => {
  return returnValue && typeof (returnValue as { then: Function }).then === 'function';
};

export const httpRequestPromisify = (options: RequestOptions | string | URL) => {
  return new Promise<IncomingMessage>((resolve) => {
    return http.request(options, resolve);
  });
};

export const httpsRequestPromisify = (options: RequestOptions | string | URL) => {
  return new Promise<IncomingMessage>((resolve) => {
    return https.request(options, resolve);
  });
};
