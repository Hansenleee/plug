import { Inject, Service } from 'typedi';
import http from 'http';
import net from 'net';
import HttpProxy from 'http-proxy';
import { ProxyOrigin } from './proxy-origin';
import { ProxyMock } from './mock';
import { Forward } from './forward';

@Service()
export class Proxy {
  @Inject()
  mock: ProxyMock;

  @Inject()
  forward: Forward;

  @Inject()
  private origin: ProxyOrigin;

  private proxyServer: HttpProxy = HttpProxy.createProxyServer({
    secure: false,
  });

  // 请求代理转发的核心入口
  async proxy(request: http.IncomingMessage, response: http.ServerResponse) {
    const forwardCheckResult = this.forward.has(request);

    if (forwardCheckResult.forwardItem) {
      return this.forward.forward(request, response, forwardCheckResult);
    }

    const mockCheckResult = this.mock.has(request);

    if (mockCheckResult) {
      return this.mock.mock(mockCheckResult, request, response);
    }

    return this.origin.proxy(request, response);
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
