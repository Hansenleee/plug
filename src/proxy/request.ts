import Container, { Service } from 'typedi';
import http from 'http';
import https from 'https';
import { URL } from 'url';
import ProxyAgent from 'proxy-agent';
import HttpProxy from 'http-proxy';
import fetch, { Headers } from 'node-fetch';
import { Configuration } from '../configuration';
import { Storage } from '../storage';
import { Logger } from '../shared/log';
import { ResponseDataInfo, Protocol } from '../types';
import { getResponseData, getErrorResponseDataInfo } from '../shared/request-meta';

const log = new Logger('proxy-request');

@Service()
export class Request {
  private proxyServer: HttpProxy = HttpProxy.createProxyServer({
    secure: false,
  });

  request(request: http.IncomingMessage, response: http.ServerResponse, protocol: Protocol) {
    if (protocol === 'http') {
      return this.http(request, response);
    }

    return this.https(request, response);
  }

  private getProxyAgent(): { agent?: http.Agent } {
    const originProxyPort =
      Container.get(Storage).system.getMemoryConfig().originSystemProxyPort ||
      Configuration.ORIGIN_PROXY_PORT;

    if (originProxyPort) {
      return {
        agent: new ProxyAgent(
          `http://${Configuration.PROXY_HOST}:${originProxyPort}`
        ) as unknown as http.Agent,
      };
    }

    return {};
  }

  private http(request: http.IncomingMessage, response: http.ServerResponse) {
    const { hostname, port, pathname, protocol, search } = new URL(request.url);

    return this.baseHandler(request, response, {
      hostname,
      port,
      path: pathname + search,
      method: request.method,
      protocol,
      headers: request.headers,
      rejectUnauthorized: false,
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
      rejectUnauthorized: false,
    });
  }

  private async baseHandler(
    request: http.IncomingMessage,
    response: http.ServerResponse,
    options: https.RequestOptions
  ): Promise<ResponseDataInfo> {
    log.info(`请求[${options.protocol}] ${request.url} 准备代理到原地址`);

    if (request.formData) {
      return this.baseFormRequest(request, response);
    }

    return this.baseJsonRequest(request, response, options);
  }

  private async baseFormRequest(request: http.IncomingMessage, response: http.ServerResponse) {
    const formHeader = new Headers(request.headers as Record<string, string>);

    formHeader.delete('content-type');

    const formResult = await fetch(request.url, {
      method: request.method,
      body: request.formData,
      headers: formHeader.raw() as unknown as Record<string, string>,
    });
    const formResultText = await formResult.text();
    const responseHeader = formResult.headers as unknown as http.OutgoingHttpHeaders;

    response.setHeader('Content-Type', 'application/json');
    response.writeHead(200, formResult.headers.raw());
    response.end(formResultText);

    return {
      statusCode: formResult.status,
      headers: responseHeader,
      data: formResultText,
    };
  }

  private baseJsonRequest(
    request: http.IncomingMessage,
    response: http.ServerResponse,
    options: https.RequestOptions
  ) {
    const requestClient = options.protocol.startsWith('https') ? https : http;

    return new Promise<ResponseDataInfo>((resolve) => {
      const proxyToOriginRequest = requestClient.request(
        {
          ...options,
          ...this.getProxyAgent(),
        },
        (proxyResult) => {
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
        }
      );

      if (request.body) {
        proxyToOriginRequest.write(request.formData || request.body);
      }

      request.pipe(proxyToOriginRequest);

      proxyToOriginRequest.on('error', (error) => {
        log.warn(`代理请求[${options.protocol}] ${request.url} 转发异常: ${error.message}`, {
          force: true,
        });
        resolve(getErrorResponseDataInfo());
      });
    });
  }
}
