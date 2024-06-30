import { Service } from 'typedi';
import http from 'http';
import https from 'https';
import url from 'url';
import { Logger } from '../shared/log';

const log = new Logger('proxy-request');

@Service()
export class ProxyRequest {
  handle(request: http.IncomingMessage, response: http.ServerResponse) {
    const { hostname, port, path, protocol } = url.parse(request.url);
    const requestClient = protocol.startsWith('https') ? https : http;

    log.info(`代理到源请求地址: ${request.url}`);

    const proxyToOriginRequest = requestClient.request(
      {
        hostname,
        port,
        path,
        method: request.method,
        headers: request.headers,
      },
      (proxyRes) => {
        response.writeHead(proxyRes.statusCode, proxyRes.headers);
        proxyRes.pipe(response);
      }
    );

    request.pipe(proxyToOriginRequest);

    proxyToOriginRequest.on('error', (error) => {
      log.info(`代理请求转发异常: ${error.message}`);
    });
  }
}
