import { Container, Service } from 'typedi';
import http from 'http';
import { Controller } from '../controller';
import { Proxy } from '../proxy';
import { Logger } from '../shared/log';
import { Protocol } from '../types';

@Service()
export class BaseServer {
  protected logger!: Logger;

  constructor(private protocol: Protocol) {
    this.logger = new Logger(this.protocol);
  }

  protected async requestHandler(request: http.IncomingMessage, response: http.ServerResponse) {
    const controller = Container.get<Controller>(Controller);
    const proxy = Container.get<Proxy>(Proxy);
    const requestId = await controller.record.saveRequestRecords(request, this.protocol);

    const proxyResponseData = await proxy.proxy(request, response, this.protocol);

    return controller.record.saveResponseRecords(proxyResponseData, {
      requestId,
    });
  }

  protected closeHandler() {
    this.logger.info(`${this.protocol} server closed`);
  }

  protected errorHandler(error) {
    this.logger.info(`${this.protocol} server error occured: ${error.message}`);
  }
}
