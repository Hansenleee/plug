import { Service } from 'typedi';
import http from 'http';
import https from 'https';
import { URL } from 'url';
import { Logger } from '../shared/log';
import { ResponseDataInfo, Protocol } from '../types';
import { getResponseData, getErrorResponseDataInfo } from '../shared/request-meta';

const log = new Logger('proxy-request');

@Service()
export class Request {
  request(request: http.IncomingMessage, response: http.ServerResponse, protocol: Protocol) {
    if (protocol === 'http') {
      return this.http(request, response);
    }

    return this.https(request, response);
  }

  private http(request: http.IncomingMessage, response: http.ServerResponse) {
    const { hostname, port, pathname, protocol } = new URL(request.url);

    return this.baseHandler(request, response, {
      hostname,
      port,
      path: pathname,
      method: request.method,
      protocol,
      headers: request.headers,
    });
  }

  private https(request: http.IncomingMessage, response: http.ServerResponse) {
    const { host } = request.headers;
    const [hostname, port = 443] = host.split(':');

    return this.baseHandler(request, response, {
      hostname,
      port,
      path: request.url,
      method: request.method,
      protocol: 'https:',
      headers: request.headers,
    });
  }

  private baseHandler(
    request: http.IncomingMessage,
    response: http.ServerResponse,
    options: http.RequestOptions
  ): Promise<ResponseDataInfo> {
    const requestClient = options.protocol.startsWith('https') ? https : http;

    log.info(`请求[${options.protocol}] ${request.url} 准备代理到原地址`);

    return new Promise((resolve) => {
      const proxyToOriginRequest = requestClient.request(options, async (proxyResult) => {
        response.writeHead(proxyResult.statusCode, proxyResult.headers);
        proxyResult.pipe(response);

        const responseMessage = getResponseData(proxyResult);

        responseMessage.response.on('end', () => {
          resolve({
            statusCode: proxyResult.statusCode,
            headers: proxyResult.headers,
            data: responseMessage.getData(),
          });
        });
      });

      if (request.body) {
        proxyToOriginRequest.write(request.body);
      }

      request.pipe(proxyToOriginRequest);

      proxyToOriginRequest.on('error', (error) => {
        log.info(`代理请求转发异常: ${error.message}`);
        resolve(getErrorResponseDataInfo());
      });
    });
  }
}
