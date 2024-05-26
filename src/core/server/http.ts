import Container, { Service } from 'typedi';
import http from 'http';
import { Proxy } from '../proxy';
import { Controller } from '../controller';
import { Logger } from '../shared/log';
import { Configuration } from '../../configuration';

const logger = new Logger('http');

@Service()
export class Http {
  httpServer: http.Server = new http.Server(this.requestHandler);

  start() {
    this.httpServer.on('connect', () => {});

    this.httpServer.on('close', () => {
      logger.info(`http server closed`);
    });

    this.httpServer.listen(Configuration.PROXY_PORT, () => {
      logger.info(`http server start at ${Configuration.PROXY_PORT}`);
    });
  }

  private requestHandler(request: http.IncomingMessage, response: http.ServerResponse) {
    const controller = Container.get<Controller>(Controller);
    const proxyInstance = Container.get<Proxy>(Proxy);

    controller.record.saveRecords(request);
    proxyInstance.httpHandler(request, response);
  }
}
