import { Service } from 'typedi';
import http from 'http';
import https from 'https';
import { URL } from 'url';
import { Logger } from '../shared/log';

const log = new Logger('proxy-request');

@Service()
export class ProxyRequest {
  httpHandler(request: http.IncomingMessage, response: http.ServerResponse) {
    const { hostname, port, pathname, protocol } = new URL(request.url);

    return this.handle(request, response, {
      hostname,
      port,
      path: pathname,
      method: request.method,
      protocol,
      headers: request.headers,
    });
  }

  httpsHandler(request: http.IncomingMessage, response: http.ServerResponse) {
    const { host } = request.headers;
    const [hostname, port = 443] = host.split(':');

    return this.handle(request, response, {
      hostname,
      port,
      path: request.url,
      method: request.method,
      protocol: 'https:',
      headers: request.headers,
    });
  }

  private handle(
    request: http.IncomingMessage,
    response: http.ServerResponse,
    options: http.RequestOptions
  ) {
    const requestClient = options.protocol.startsWith('https') ? https : http;

    log.info(`请求[${options.protocol}] ${request.url} 准备代理到原地址`);

    return new Promise<http.IncomingMessage>((resolve) => {
      const proxyToOriginRequest = requestClient.request(options, (proxyResult) => {
        response.writeHead(proxyResult.statusCode, proxyResult.headers);
        proxyResult.pipe(response);

        proxyResult.on('end', () => {
          resolve(proxyResult);
        });
      });

      request.pipe(proxyToOriginRequest);

      proxyToOriginRequest.on('error', (error) => {
        log.info(`代理请求转发异常: ${error.message}`);
      });
    });
  }
}