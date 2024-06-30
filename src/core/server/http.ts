import Container, { Service } from 'typedi';
import http from 'http';
import net from 'net';
import { ProxyRequest } from '../proxy';
import { Controller } from '../controller';
import { Logger } from '../shared/log';
import { Configuration } from '../../configuration';

const logger = new Logger('http');

@Service()
export class Http {
  httpServer: http.Server = new http.Server(this.requestHandler);

  start() {
    this.httpServer.on('connect', () => this.connectHanlder);

    this.httpServer.on('close', () => {
      logger.info(`http server closed`);
    });

    this.httpServer.on('error', (error) => {
      logger.info(`http server error occured: ${error.message}`);
    });

    this.httpServer.listen(Configuration.PROXY_PORT, () => {
      logger.info(`http server start at ${Configuration.PROXY_PORT}`);
    });
  }

  private requestHandler(request: http.IncomingMessage, response: http.ServerResponse) {
    const controller = Container.get<Controller>(Controller);
    const proxyRequest = Container.get<ProxyRequest>(ProxyRequest);

    controller.record.saveRecords(request);
    proxyRequest.handle(request, response);
  }

  private connectHanlder() {}
}
