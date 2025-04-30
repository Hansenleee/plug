import Container, { Service } from 'typedi';
import EventEmitter from 'events';
import http from 'http';
import https from 'https';
import ProxyAgent from 'proxy-agent';
import fetch, { Headers } from 'node-fetch';
import { Configuration } from '../configuration';
import { Storage } from '../storage';
import { ResponseDataInfo } from '../types';
import { getResponseData } from '../shared/request-meta';
import { RequestParser } from '../shared/request-parser';
import { RtHelper } from './rt-helper';

@Service()
export class RequestHelper extends EventEmitter<{ beforeRequest: []; errorRequest: [Error] }> {
  private static readonly ERROR_RESPONSE_DATA: ResponseDataInfo = {
    statusCode: 408,
    headers: {
      date: '',
      'content-length': '',
      'content-type': '',
    },
    data: '',
  };

  constructor(
    private readonly request: http.IncomingMessage,
    private readonly response: http.ServerResponse,
    private readonly options: {
      parser: RequestParser;
      extraReqHeader?: Record<string, string>;
      extraResHeader?: Record<string, string>;
      rt?: number;
    }
  ) {
    super();
  }

  private get requestHeaders(): http.IncomingHttpHeaders {
    return {
      ...(this.request.headers || {}),
      ...(this.options.extraReqHeader || {}),
    };
  }

  invokeRequest() {
    return this.options.parser.isHttps ? this.https() : this.http();
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

  private http() {
    const { hostname, port, pathname, protocol, search } = this.options.parser.completeUrl;

    return this.baseRequestHandler({
      hostname,
      port,
      path: pathname + search,
      method: this.request.method,
      protocol,
      headers: this.requestHeaders,
      rejectUnauthorized: false,
    });
  }

  private https() {
    const [hostname, port = 443] = this.options.parser.host.split(':');

    return this.baseRequestHandler({
      hostname,
      port,
      path: this.options.parser.completeUrl.href,
      method: this.request.method,
      protocol: 'https:',
      headers: this.requestHeaders,
      rejectUnauthorized: false,
    });
  }

  private async baseRequestHandler(options: https.RequestOptions): Promise<ResponseDataInfo> {
    this.emit('beforeRequest');

    if (this.request.formData) {
      return this.baseFormRequest();
    }

    return this.baseJsonRequest(options);
  }

  private async baseFormRequest() {
    const formHeader = new Headers(this.requestHeaders as Record<string, string>);

    formHeader.delete('content-type');

    const formResult = await RtHelper.promisify(() => {
      return fetch(this.options.parser.completeUrl.href, {
        method: this.request.method,
        body: this.request.formData,
        headers: formHeader.raw() as unknown as Record<string, string>,
      });
    }, this.options.rt);
    const formResultText = await formResult.text();
    const responseHeader = {
      ...formResult.headers.raw(),
      ...(this.options.extraResHeader || {}),
    };

    this.response.setHeader('Content-Type', 'application/json');
    this.response.writeHead(200, responseHeader);
    this.response.end(formResultText);

    return {
      statusCode: formResult.status,
      headers: responseHeader,
      data: formResultText,
    };
  }

  private baseJsonRequest(options: https.RequestOptions) {
    const requestClient = this.options.parser.isHttps ? https : http;
    const rtHelper = RtHelper.start(this.options.rt);

    return new Promise<ResponseDataInfo>((resolve) => {
      const proxyToOriginRequest = requestClient.request(
        {
          ...options,
          ...this.getProxyAgent(),
        },
        async (proxyResult) => {
          await rtHelper.end();

          const responseHeaders = {
            ...(proxyResult.headers || {}),
            ...(this.options.extraResHeader || {}),
          };

          this.response.writeHead(proxyResult.statusCode, responseHeaders);
          proxyResult.pipe(this.response);

          const responseMessage = getResponseData(proxyResult);

          responseMessage.response.on('end', () => {
            resolve({
              statusCode: proxyResult.statusCode,
              headers: responseHeaders,
              data: responseMessage.getData(),
            });
          });
        }
      );

      if (this.request.body) {
        proxyToOriginRequest.write(this.request.formData || this.request.body);
      }

      this.request.pipe(proxyToOriginRequest);

      proxyToOriginRequest.on('error', (error) => {
        this.emit('errorRequest', error);
        resolve(RequestHelper.ERROR_RESPONSE_DATA);
      });
    });
  }
}
