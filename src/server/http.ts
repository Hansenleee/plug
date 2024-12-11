import { Service } from 'typedi';
import http from 'http';
import net from 'net';
import { URL } from 'url';
import HttpProxy from 'http-proxy';
import { BaseServer } from './base';
import { Configuration } from '../configuration';

@Service()
export class Http extends BaseServer {
  server: http.Server = new http.Server();

  private proxyServer: HttpProxy = HttpProxy.createProxyServer({
    secure: false,
  });

  constructor() {
    super('http');
  }

  start() {
    this.server.on('request', this.requestHandler.bind(this));
    this.server.on('connect', this.connectHandler.bind(this));
    this.server.on('close', this.closeHandler.bind(this));
    this.server.on('error', this.errorHandler.bind(this));
    this.server.on('upgrade', this.upgradeHandler.bind(this));

    this.server.listen(Configuration.PROXY_PORT, () => {
      this.logger.info(`http server start at ${Configuration.PROXY_PORT}`, { force: true });
    });
  }

  private connectHandler(request: http.IncomingMessage, socket: net.Socket, head: Buffer) {
    const port = request.url.split(':')?.[1];
    const proxyPort = +port !== 443 ? Configuration.PROXY_PORT : Configuration.HTTPS_PROXY_PORT;

    const serverSocket = net.connect(proxyPort, Configuration.PROXY_HOST, () => {
      socket.write(`HTTP/${request.httpVersion} 200 OK\r\n\r\n`, 'utf-8', (err) => {
        if (err) {
          this.logger.warn(`connect error ${err.message}`);

          return;
        }

        serverSocket.write(head);
        serverSocket.pipe(socket);
        socket.pipe(serverSocket);
      });
    });
  }

  private upgradeHandler(request: http.IncomingMessage, socket: net.Socket, head: Buffer) {
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
