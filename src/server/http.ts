import { Service } from 'typedi';
import http from 'http';
import net from 'net';
import { BaseServer } from './base';
import { Configuration } from '../configuration';

@Service()
export class Http extends BaseServer {
  server: http.Server = new http.Server();

  constructor() {
    super('http');
  }

  start() {
    this.server.on('request', this.requestHandler.bind(this));
    this.server.on('connect', this.connectHandler.bind(this));
    this.server.on('close', this.closeHandler.bind(this));
    this.server.on('error', this.errorHandler.bind(this));

    this.server.listen(Configuration.PROXY_PORT, () => {
      this.logger.info(`http server start at ${Configuration.PROXY_PORT}`, { force: true });
    });
  }

  private connectHandler(request: http.IncomingMessage, socket: net.Socket, head: Buffer) {
    const port = request.url.split(':')?.[1];

    if (+port !== 443) {
      this.logger.warn(`请求 ${request.url} 对应的端口 ${port} 非 443，异常！`);

      return;
    }

    const serverSocket = net.connect(
      Configuration.HTTPS_PROXY_PORT,
      Configuration.PROXY_HOST,
      () => {
        socket.write(`HTTP/${request.httpVersion} 200 OK\r\n\r\n`, 'utf-8', (err) => {
          if (err) {
            this.logger.warn(`connect error ${err.message}`);

            return;
          }

          serverSocket.write(head);
          serverSocket.pipe(socket);
          socket.pipe(serverSocket);
        });
      }
    );
  }
}
