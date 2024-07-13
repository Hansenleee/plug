import Container, { Service } from 'typedi';
import http from 'http';
import net from 'net';
import { ProxyRequest } from '../proxy';
import { Controller } from '../controller';
import { Logger } from '../shared/log';
import { Configuration } from '../configuration';

const logger = new Logger('http');

@Service()
export class Http {
  server: http.Server = new http.Server();

  start() {
    this.server.on('request', this.requestHandler.bind(this));
    this.server.on('connect', this.connectHanlder.bind(this));
    this.server.on('close', this.closeHandler.bind(this));
    this.server.on('error', this.errorHandler.bind(this));

    this.server.listen(Configuration.PROXY_PORT, () => {
      logger.info(`http server start at ${Configuration.PROXY_PORT}`);
    });
  }

  private requestHandler(request: http.IncomingMessage, response: http.ServerResponse) {
    const controller = Container.get<Controller>(Controller);
    const proxyRequest = Container.get<ProxyRequest>(ProxyRequest);

    controller.record.saveRecords(request);
    proxyRequest.httpHandler(request, response);
  }

  private connectHanlder(request: http.IncomingMessage, socket: net.Socket, head: Buffer) {
    const port = request.url.split(':')?.[1];

    if (+port !== 443) {
      logger.warn(`请求 ${request.url} 对应的端口 ${port} 非 443，异常！`);

      return;
    }

    const serverSocket = net.connect(
      Configuration.HTTPS_PROXY_PORT,
      Configuration.PROXY_HOST,
      () => {
        socket.write(`HTTP/${request.httpVersion} 200 OK\r\n\r\n`, 'utf-8', (err) => {
          if (err) {
            logger.warn(`connect error ${err.message}`);

            return;
          }

          serverSocket.write(head);
          serverSocket.pipe(socket);
          socket.pipe(serverSocket);
        });
      }
    );
  }

  private closeHandler() {
    logger.info(`http server closed`);
  }

  private errorHandler(error) {
    logger.info(`http server error occured: ${error.message}`);
  }
}
