import { Inject, Service } from 'typedi';
import http from 'http';
import net from 'net';
import HttpProxy from 'http-proxy';
import { Request } from './request';
import { ProxyMock } from './mock';
import { Protocol } from '../types';

@Service()
export class Proxy {
  @Inject()
  mock: ProxyMock;

  @Inject()
  private request: Request;

  private proxyServer: HttpProxy = HttpProxy.createProxyServer({
    secure: false,
  });

  // 请求代理转发的核心入口
  async proxy(request: http.IncomingMessage, response: http.ServerResponse, protocol: Protocol) {
    const mockCheckResult = this.mock.check(request);

    if (mockCheckResult) {
      return this.mock.mock(mockCheckResult, request, response);
    }

    return this.request.request(request, response, protocol);
  }

  proxyWS(request: http.IncomingMessage, socket: net.Socket, head: Buffer) {
    const fullUrl = `ws://${request.headers.host}${request.url}`;
    const { hostname, port, protocol } = new URL(fullUrl);

    this.proxyServer.ws(request, socket, head, {
      target: {
        hostname,
        port,
        protocol,
      },
    });
  }
}
